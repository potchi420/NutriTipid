/* NutriTipid Assistant. Rule-based answers from local data and fixed text,
   no network. The UI only calls NutriTipidAssistant.answer(text, ctx), so a
   real model can replace the engine through setEngine without UI changes.
   reads the profile, intake and weight logs inside the browser, never stores
   or sends chat text.
   */
(function () {
  "use strict";
  var W = window;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var STARTERS = [
    "How much protein is in adobo?",
    "High protein under P50",
    "What can I afford today?",
    "Why is this dish in my plan?",
    "Am I on track?",
    "What is TDEE?"
  ];
  var ESTIMATE = "Values are working estimates pending PhilFCT verification.";
  var RULE = "The planner picks dishes that fit your daily budget and give the most protein per peso, after removing dishes with your allergens.";

  /* admin renames keep the original name as key, aliases hang off it */
  var ALIASES = {
    "Lugaw": ["lugaw", "rice porridge"],
    "Arroz caldo w/ egg": ["arroz caldo", "arrozcaldo", "arroz caldo with egg"],
    "Fried egg and rice": ["fried egg and rice", "fried egg", "egg and rice", "egg rice"],
    "Chicken Tinola": ["tinola", "chicken tinola", "tinolang manok"],
    "Chicken Adobo": ["adobo", "chicken adobo", "adobong manok"],
    "Pork Menudo": ["menudo", "pork menudo"],
    "Pork Sinigang": ["pork sinigang", "sinigang na baboy", "sinigang baboy", "sinigang na pork"],
    "Ginisang Monggo": ["monggo", "mongo", "munggo", "ginisang monggo", "mung bean"],
    "Adobong Kangkong": ["adobong kangkong", "kangkong", "kangkong adobo"],
    "Beef Caldereta": ["caldereta", "kaldereta", "beef caldereta", "kalderetang baka"],
    "Chop Suey": ["chop suey", "chopsuey", "chopseuy"],
    "Sinigang na Hipon": ["sinigang na hipon", "sinigang hipon", "shrimp sinigang", "hipon"],
    "Sinigang na Bangus": ["sinigang na bangus", "sinigang bangus", "bangus", "milkfish sinigang"]
  };
  /* well known dishes that are not on the price board */
  var OFFBOARD = [
    { name: "Kare-kare", al: ["kare kare", "karekare"], allergens: ["Peanut"], note: "Kare-kare is traditionally made with a peanut sauce." },
    { name: "Pinakbet", al: ["pinakbet", "pakbet"] },
    { name: "Sisig", al: ["sisig"] },
    { name: "Tapsilog", al: ["tapsilog"] },
    { name: "Bistek Tagalog", al: ["bistek tagalog", "bistek"] },
    { name: "Lechon", al: ["lechon"] },
    { name: "Pancit", al: ["pancit"] },
    { name: "Bulalo", al: ["bulalo"] },
    { name: "Nilaga", al: ["nilaga"] }
  ];
  var SNACKS = ["Lugaw", "Fried egg and rice", "Arroz caldo w/ egg"];
  var VEG = ["Adobong Kangkong", "Chop Suey"];
  /* words people type for each of the seven groups, toyo counts for two */
  var ALLERGEN_WORDS = {
    shellfish: ["shellfish", "shrimp", "hipon", "prawn", "prawns", "crab", "alimango", "squid", "pusit", "mussels", "tahong", "bagoong alamang", "oyster sauce"],
    fish: ["fish", "isda", "bangus", "patis", "bagoong isda", "dilis"],
    egg: ["egg", "eggs", "itlog", "itlog pugo", "salted egg"],
    milk: ["milk", "gatas", "cheese", "keso", "butter"],
    peanut: ["peanut", "peanuts", "mani", "peanut butter"],
    wheat: ["wheat", "bread", "tinapay", "flour", "harina", "toyo"],
    soy: ["soy", "toyo", "tokwa", "taho", "tausi"]
  };
  /* mirrors the dashboard: EAT as [pesos, kcal] and Thursday's planned meals */
  var EAT = [[15, 280], [35, 520], [40, 520], [45, 460], [25, 320], [30, 420], [0, 240]];
  var TODAY_PLAN = [6, 3, 4, 0];
  var TODAY_KEY = "3";

  function readJson(key) {
    try {
      var v = JSON.parse(W.localStorage.getItem(key) || "null");
      if (v && typeof v === "object") return v;
    } catch (e) {}
    return null;
  }
  function T(s) { return { type: "text", text: s }; }
  function L(items) { return { type: "list", items: items }; }
  function R(rows) { return { type: "rows", rows: rows }; }
  function N(s) { return { type: "note", text: s }; }
  function A(s, href) { return { type: "link", text: s, href: href }; }
  function out(intent, parts, sugs) { return { intent: intent, parts: parts, suggestions: (sugs || []).slice(0, 2) }; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function num(n) { return Math.round(n).toLocaleString("en-US"); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function joinList(a) {
    if (a.length < 2) return a.join("");
    return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  }

  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    s = s.replace(/(\d),(\d{3})/g, "$1$2");
    s = s.replace(/\u20b1\s*/g, "p");
    s = s.replace(/(\d+)\s*(pesos?|php)\b/g, "p$1");
    s = s.replace(/\b(php|pesos?)\s*(\d+)/g, "p$2");
    s = s.replace(/[^a-z0-9\s]/g, " ");
    return s.replace(/\s+/g, " ").trim();
  }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
    }
    return d[m][n];
  }

  /* profile and lists */
  function profile() { return readJson("nutritipid-profile"); }
  function listOf(p, k) {
    if (!p || !Array.isArray(p[k])) return [];
    return p[k].filter(function (v) { return v && v !== "None"; });
  }
  function budgetOf(p) { return p && p.budget >= 50 ? Math.round(p.budget) : 100; }
  function kcalTargetOf() { return W.NutriTipid && W.NutriTipid.kcalTarget ? W.NutriTipid.kcalTarget() : 1500; }
  function hit(list, name) {
    return list.some(function (v) { return String(v).toLowerCase() === String(name).toLowerCase(); });
  }
  /* the profile check is the shared one from profile.js, extra holds
     groups named in the question itself ("no fish") */
  function conflicts(al, extra) {
    var N = W.NutriTipid;
    if (!N || !N.allergenConflicts) return [];
    var res = N.allergenConflicts(al).slice();
    var has = N.normalizeAllergens(al);
    (extra || []).forEach(function (a) {
      if (hit(has, a) && !hit(res, a)) res.push(a);
    });
    return res;
  }
  function allergenLabels() {
    var base = W.NutriTipid && W.NutriTipid.allergenGroups ? W.NutriTipid.allergenGroups.slice() : ["Shellfish", "Fish", "Egg", "Milk", "Peanut", "Wheat", "Soy"];
    var B = W.NutriTipidBoard;
    if (B && B.allergens) {
      B.allergens().forEach(function (a) { if (!hit(base, a)) base.push(a); });
    }
    return base;
  }
  /* "no shrimp", "without egg", "peanut free" */
  function textAvoid(t) {
    var res = [];
    allergenLabels().forEach(function (label) {
      var words = ALLERGEN_WORDS[label.toLowerCase()] || [label.toLowerCase()];
      words.forEach(function (w) {
        var re = new RegExp("\\b(no|without|avoid|skip|allergic to|allergy to|free of|not|minus)\\s+(any\\s+)?" + w + "\\b|\\b" + w + " free\\b");
        if (re.test(t) && !hit(res, label)) res.push(label);
      });
    });
    return res;
  }

  /* dishes with the admin board applied, same rules as the planner */
  function catalogue() {
    var B = W.NutriTipidBoard;
    var base = Array.isArray(W.NutriTipidFoods) ? W.NutriTipidFoods : [];
    var list = [];
    base.forEach(function (f) {
      var d = { key: f.name, name: f.name, price: f.price, kcal: f.kcal, protein: f.protein, cat: f.cat || "Ulam", al: (f.al || []).slice(), extra: false, src: f };
      if (B) {
        var m = B.metaOf(f.name);
        if (m) {
          if (m.name) d.name = m.name;
          if (m.cat) d.cat = m.cat;
          if (m.al) d.al = m.al.slice();
          if (typeof m.kcal === "number") d.kcal = m.kcal;
          if (typeof m.protein === "number") d.protein = m.protein;
        }
        d.price = B.priceOf(f.name, f.price);
        d.active = B.isActive(f.name);
      } else {
        d.active = true;
      }
      list.push(d);
    });
    if (B) {
      B.extraDishes().forEach(function (x) {
        list.push({
          key: x.name, name: x.name, price: B.priceOf(x.name, x.price), kcal: x.kcal, protein: x.protein,
          cat: x.cat || "Ulam", al: (x.al || []).slice(), extra: true, active: B.isActive(x.name), src: x
        });
      });
    }
    return list;
  }
  function live(list) { return list.filter(function (d) { return d.active; }); }
  function ppp(d) { return d.price > 0 ? d.protein / d.price : d.protein; }
  function isSnack(d) { return SNACKS.indexOf(d.key) >= 0 || (d.extra && d.cat === "Rice meal"); }
  function aliasesOf(d) {
    var a = (ALIASES[d.key] || []).concat([d.name, d.key]);
    return a.map(norm).filter(function (x, i, arr) { return x && arr.indexOf(x) === i; });
  }

  /* longest alias first, matched text is blanked so adobo never hides inside adobong kangkong */
  function findDishes(t, cat) {
    var cands = [], found = [], seen = {};
    cat.forEach(function (d) { aliasesOf(d).forEach(function (a) { cands.push({ a: a, dish: d }); }); });
    OFFBOARD.forEach(function (o) { o.al.forEach(function (a) { cands.push({ a: norm(a), off: o }); }); });
    cands.sort(function (x, y) { return y.a.length - x.a.length; });
    var w = " " + t + " ";
    function blank(s, i, n) { return s.slice(0, i) + new Array(n + 1).join("_") + s.slice(i + n); }
    function take(c, pos) {
      var id = c.dish ? "d:" + c.dish.key : "o:" + c.off.name;
      if (seen[id]) return;
      seen[id] = 1;
      found.push({ dish: c.dish, off: c.off, pos: pos });
    }
    cands.forEach(function (c) {
      var i = w.indexOf(" " + c.a + " ");
      if (i >= 0) { take(c, i); w = blank(w, i + 1, c.a.length); }
    });
    var cw = w.replace(/ /g, "");
    cands.forEach(function (c) {
      if (c.a.indexOf(" ") < 0) return;
      var k = c.a.replace(/ /g, "");
      var j = cw.indexOf(k);
      if (j >= 0) { take(c, j); cw = blank(cw, j, k.length); }
    });
    w.split(" ").forEach(function (tok) {
      if (tok.length < 5 || tok.indexOf("_") >= 0) return;
      cands.some(function (c) {
        if (c.a.indexOf(" ") >= 0 || c.a.length < 5 || Math.abs(c.a.length - tok.length) > 1) return false;
        if (lev(tok, c.a) > 1) return false;
        take(c, t.indexOf(tok));
        return true;
      });
    });
    found.sort(function (x, y) { return x.pos - y.pos; });
    return found;
  }

  /* today's log, the way the dashboard builds Thursday */
  function todayLog() {
    var refs = TODAY_PLAN.slice();
    var intake = readJson("nutritipid-intake");
    var day = intake && intake[TODAY_KEY];
    if (day && typeof day === "object") {
      ["0", "1", "2", "3"].forEach(function (s) {
        if (Array.isArray(day[s])) refs = refs.concat(day[s]);
      });
    }
    var foods = readJson("nutritipid-foods");
    var spent = 0, kcal = 0;
    refs.forEach(function (r) {
      if (typeof r === "number" && EAT[r]) { spent += EAT[r][0]; kcal += EAT[r][1]; return; }
      if (Array.isArray(foods)) {
        foods.forEach(function (f) {
          if (f && f.id === r && isFinite(f.p) && isFinite(f.k)) { spent += Number(f.p); kcal += Number(f.k); }
        });
      }
    });
    return { spent: spent, kcal: kcal };
  }
  function dayState(prof) {
    var log = todayLog();
    var budget = budgetOf(prof);
    var target = kcalTargetOf();
    return { spent: log.spent, kcal: log.kcal, budget: budget, target: target, left: budget - log.spent, kcalLeft: target - log.kcal };
  }

  /* weight trend, same rule as the Progress page: last 42 days, 3+ entries over 7+ days, least squares */
  function dayNumber(iso) {
    var p = String(iso).split("-");
    return Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])) / 86400000;
  }
  function fmtDay(dayNum) {
    var d = new Date(dayNum * 86400000);
    return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate();
  }
  function weightData() {
    var res = null;
    if (typeof W.NutriTipidWeightLog === "function") {
      try { res = W.NutriTipidWeightLog(); } catch (e) {}
    }
    if (!res) {
      var s = readJson("nutritipid-weight");
      if (s && Array.isArray(s.entries)) res = { targetKg: s.targetKg, entries: s.entries };
    }
    if (!res || !Array.isArray(res.entries)) return { targetKg: null, entries: [] };
    var rows = res.entries.filter(function (e) { return e && e.date && isFinite(e.kg); });
    rows.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    return { targetKg: res.targetKg, entries: rows };
  }
  function forecast(rows, goal, target) {
    var last = rows[rows.length - 1];
    var lastDay = dayNumber(last.date);
    var win = rows.filter(function (r) { return dayNumber(r.date) >= lastDay - 42; });
    if (win.length < 3) return { ok: false };
    var base = dayNumber(win[0].date);
    if (lastDay - base < 7) return { ok: false };
    var n = win.length, mx = 0, my = 0, i, num = 0, den = 0;
    var xs = win.map(function (r) { return dayNumber(r.date) - base; });
    var ys = win.map(function (r) { return r.kg; });
    for (i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n;
    for (i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) * (xs[i] - mx); }
    if (!(den > 0)) return { ok: false };
    var slope = num / den;
    var weekly = slope * 7, status;
    if (goal === "hold") {
      status = Math.abs(weekly) < 0.25 ? "holding" : "drifting";
    } else {
      var toward = goal === "lose" ? -weekly : weekly;
      status = toward >= 0.1 ? "ontrack" : toward <= -0.1 ? "off" : "stalled";
    }
    var reached = (goal === "lose" && last.kg <= target) || (goal === "gain" && last.kg >= target);
    var eta = null, far = false;
    if (status === "ontrack" && !reached) {
      var d = (target - last.kg) / slope;
      if (d > 364) far = true; else eta = fmtDay(lastDay + Math.max(1, Math.ceil(d)));
    }
    return { ok: true, status: status, weekly: weekly, reached: reached, eta: eta, far: far };
  }
  function signedKg(v) { return (v < 0 ? "-" : "+") + Math.abs(v).toFixed(1) + " kg a week"; }

  /* intents */
  var MED = [
    /\b(dizzy|dizziness|faint|fainting|nausea|nauseous|vomit\w*|purg\w*|chest pain|palpitations?|headache|fever|diarrhea|symptoms?|sick|pain|allergic reaction|anaphyla\w*|swollen|swelling|rash)\b/,
    /\b(medicine|medicines|medication|medications|meds|pills?|tablets?|dosage|dose|drugs?|insulin|prescription|antibiotics?)\b/,
    /\b(pregnant|pregnancy|breastfeeding|diabetes|diabetic|hypertension treatment|high blood|blood pressure|blood sugar|fast for|eating disorder|anorexia|bulimia|binge\w*|starv\w*|fasting|treatment|diagnos\w*)\b/
  ];
  function lowCal(t) {
    var m = /\b(\d{3,4})\s*(kcal|calories|calorie|cals?)\b/.exec(t) || /\b(kcal|calories|calorie)\s*(\d{3,4})\b/.exec(t);
    if (!m) return false;
    var n = Number(isNaN(Number(m[1])) ? m[2] : m[1]);
    if (!(n >= 100 && n < 1200)) return false;
    if (/\b(under|below|less than|max|within|up to)\s*\d/.test(t)) return false;
    return /\b(eat|eating|diet|consume|day|daily|only|just|survive|live)\b/.test(t);
  }
  function medical(low) {
    var parts = [
      T("NutriTipid can't give medical advice, and I don't want to guess about this."),
      T("Please talk to the PCU University Clinic. If it feels like an emergency, go to the nearest hospital.")
    ];
    if (low) parts.push(T("NutriTipid keeps daily calorie targets at 1,200 kcal or more, and the clinic can help you find what suits you."));
    return out("medical", parts, []);
  }

  var TERMS = [
    { re: /\btdee\b|total daily energy/, id: "tdee" },
    { re: /\bbmr\b|basal metabolic/, id: "bmr" },
    { re: /\bbmi\b|body mass/, id: "bmi" },
    { re: /deficit|surplus/, id: "deficit" },
    { re: /\bmacros?\b|macronutrients?/, id: "macros" },
    { re: /protein per peso/, id: "ppp" },
    { re: /\bpdri\b/, id: "pdri" },
    { re: /\breni\b/, id: "reni" },
    { re: /\bfnri\b/, id: "fnri" },
    { re: /philfct|food composition/, id: "philfct" },
    { re: /budget band|price band|price tier/, id: "band" },
    { re: /what is nutritipid|about nutritipid|what does nutritipid|what is this app/, id: "app" },
    { re: /how (does|do) (the )?(planner|plan) work|how is (my|the) plan (made|built|chosen)|\bplanner\b/, id: "planner" }
  ];
  function termFor(t) {
    for (var i = 0; i < TERMS.length; i++) if (TERMS[i].re.test(t)) return TERMS[i].id;
    return null;
  }
  function ruleLines(budget) {
    var c = Math.floor(budget * 0.4), s = Math.floor(budget * 0.2);
    return [
      "Your P" + budget + " a day is split into lunch up to P" + c + ", dinner up to P" + c + " and snack up to P" + s + ".",
      "Dishes with your allergens are removed first.",
      "Inside each cap, dishes are ranked by protein per peso and rotated by day so the week varies.",
      "Breakfast is packed from home at P0 until you mark it as bought on campus."
    ];
  }
  function explain(env, id) {
    var k = env.prof && W.NutriTipid && W.NutriTipid.kcalParts ? W.NutriTipid.kcalParts(env.prof) : null;
    var sugs = ["What is a calorie deficit?", "Am I on track?"];
    var parts;
    if (id === "tdee") {
      parts = [T("TDEE is your total daily energy expenditure: your BMR multiplied by your activity level. It is roughly the calories you burn in a day.")];
      if (k && k.has) parts.push(T("From your profile, yours is about " + num(k.tdee) + " kcal."));
      sugs = ["What is a calorie deficit?", "What is BMR?"];
    } else if (id === "bmr") {
      parts = [T("BMR is your basal metabolic rate, the energy your body uses at rest. NutriTipid estimates it with the Mifflin-St Jeor equation from your age, sex, weight and height.")];
      sugs = ["What is TDEE?", "What is a calorie deficit?"];
    } else if (id === "bmi") {
      parts = [T("BMI is body mass index: weight in kilograms divided by height in metres squared. NutriTipid uses the 18.5 to 24.9 range to set a healthy target weight for your height.")];
    } else if (id === "deficit") {
      parts = [T("A calorie deficit means eating fewer calories than you burn, and a surplus means eating more. NutriTipid sets your target 300 kcal below TDEE to lose weight, at TDEE to hold, and 300 kcal above to gain, and never below 1,200 kcal.")];
      sugs = ["What is TDEE?", "Am I on track?"];
    } else if (id === "macros") {
      parts = [T("Macros are the three nutrients that supply calories: protein, carbohydrates and fat.")];
      sugs = ["What is protein per peso?", "High protein under P50"];
    } else if (id === "ppp") {
      parts = [T("Protein per peso is the grams of protein a dish gives for each peso it costs. The planner uses it to find the cheapest protein inside your budget.")];
      sugs = ["High protein under P50", "How does the planner work?"];
    } else if (id === "pdri") {
      parts = [T("PDRI is the Philippine Dietary Reference Intake, the reference values for how much energy and nutrients people of each age and sex need. It is published by the DOST Food and Nutrition Research Institute (FNRI).")];
      sugs = ["What is FNRI?", "What is PhilFCT?"];
    } else if (id === "reni") {
      parts = [T("RENI is the Recommended Energy and Nutrient Intake, the older name for the Philippine reference values. The dashboard shows your micronutrients as a share of the daily RENI.")];
      sugs = ["What is PDRI?", "What is PhilFCT?"];
    } else if (id === "fnri") {
      parts = [T("FNRI is the Food and Nutrition Research Institute under the DOST. It publishes the Philippine dietary reference intakes and the Philippine Food Composition Tables.")];
      sugs = ["What is PDRI?", "What is PhilFCT?"];
    } else if (id === "philfct") {
      parts = [T("PhilFCT is the Philippine Food Composition Tables from FNRI, a database of nutrient values for foods eaten in the Philippines. NutriTipid's dish values are working estimates until they are checked against it.")];
      sugs = ["What is FNRI?", "How does the planner work?"];
    } else if (id === "band") {
      parts = [T("A budget band is a typical price tier for canteen food: plain rice costs the least, veggie and merienda pieces cost more, and full meat viands cost the most. Board prices stay inside these tiers.")];
      sugs = ["What can I afford today?", "How does the planner work?"];
    } else if (id === "app") {
      parts = [T("NutriTipid builds a 7-day meal plan from your daily budget and calorie target, then tracks your pesos, calories and weight against it.")];
      sugs = ["How does the planner work?", "What can I afford today?"];
    } else {
      parts = [T(RULE), L(ruleLines(budgetOf(env.prof)))];
      sugs = ["Why is this dish in my plan?", "What is protein per peso?"];
    }
    return out("explain", parts, sugs);
  }

  function slotsOf(name) {
    if (typeof W.NutriTipidPlan !== "function") return null;
    var res = [];
    try {
      W.NutriTipidPlan().forEach(function (rows, i) {
        rows.forEach(function (r) {
          if (r.dish === name) res.push(r.day + " " + r.slot.toLowerCase());
        });
      });
    } catch (e) { return null; }
    return res;
  }
  function why(env, dishes) {
    var h = dishes[0], budget = budgetOf(env.prof), parts = [];
    if (h && h.off) {
      parts.push(T(h.off.name + " is not in the dish pool on the price board, so the planner can't pick it."));
      parts.push(T(RULE));
    } else if (h) {
      var d = h.dish, caps = ruleLines(budget);
      var slots = slotsOf(d.name);
      if (slots && slots.length) parts.push(T(d.name + " is in your current plan: " + slots.slice(0, 4).join(", ") + (slots.length > 4 ? " and more" : "") + "."));
      else if (slots) parts.push(T(d.name + " is not in your current plan. Here is how the planner treats it."));
      else parts.push(T("Here is how the planner treats " + d.name + ". Open the Planner page to see where it lands in your week."));
      var items = [];
      var c = Math.floor(budget * 0.4), s = Math.floor(budget * 0.2);
      if (isSnack(d)) items.push("It sits in the breakfast and snack pool, which is capped at P" + s + " for a snack.");
      else items.push("At P" + d.price + " it " + (d.price <= c ? "fits" : "is over") + " the P" + c + " cap for lunch and dinner.");
      items.push("It gives " + ppp(d).toFixed(2) + " g of protein per peso (" + d.protein + " g for P" + d.price + ").");
      var bad = conflicts(d.al);
      if (bad.length) items.push("It lists " + joinList(bad) + ", which is on your allergy list, so the planner leaves it out.");
      if (!d.active) items.push("It is switched off on the price board right now.");
      parts.push(L(items));
      parts.push(T(RULE));
      void caps;
    } else {
      parts.push(T(RULE));
      parts.push(L(ruleLines(budget)));
    }
    return out("why", parts, ["What can I afford today?", "What is protein per peso?"]);
  }

  function dishRows(d) {
    var rows = [["Calories", d.kcal + " kcal"], ["Protein", d.protein + " g"]];
    var s = d.src || {};
    if (isFinite(s.carbs)) rows.push(["Carbs", s.carbs + " g"]);
    if (isFinite(s.fat)) rows.push(["Fat", s.fat + " g"]);
    if (isFinite(s.sodium)) rows.push(["Sodium", s.sodium + " mg"]);
    if (isFinite(s.iron)) rows.push(["Iron", s.iron + " mg"]);
    rows.push(["Price", "P" + d.price]);
    rows.push(["Allergens", d.al.length ? d.al.join(", ") : "None listed"]);
    return rows;
  }
  function conditionNote(d, prof) {
    var s = d.src || {}, cons = listOf(prof, "conditions"), bits = [];
    if (hit(cons, "Hypertension") && isFinite(s.sodium)) bits.push("hypertension and " + s.sodium + " mg sodium");
    if (hit(cons, "Diabetes") && isFinite(s.carbs)) bits.push("diabetes and " + s.carbs + " g carbs");
    if (hit(cons, "Anemia") && isFinite(s.iron)) bits.push("anemia and " + s.iron + " mg iron");
    if (!bits.length) return null;
    return "You listed " + joinList(bits) + ". The PCU University Clinic can tell you what suits you.";
  }
  function food(env, h) {
    var t = env.t;
    if (h.off) {
      var o = h.off, parts = [T(o.name + " is not on the NutriTipid board, so I have no calories, protein or price for it.")];
      if (o.allergens) {
        var bad = conflicts(o.allergens);
        if (bad.length) parts.push(T(o.note + " " + joinList(bad) + " is on your allergy list, so I'd skip it or ask the cook first."));
        else parts.push(T(o.note + " Nothing on your allergy list matches that."));
      } else if (/\b(safe|allerg)/.test(t)) {
        parts.push(T("I can't check its ingredients against your profile."));
      }
      return out("food", parts, ["High protein under P50", "What can I afford today?"]);
    }
    var d = h.dish, bad2 = conflicts(d.al), first;
    if (/\b(safe|ok to eat|okay to eat|can i eat|allerg\w*|contain\w*)\b/.test(t)) {
      if (bad2.length) first = d.name + " is not safe for you. It lists " + joinList(bad2) + ", which is on your allergy list.";
      else if (d.al.length) first = d.name + " lists " + joinList(d.al) + ". None of it is on your allergy list.";
      else first = "No allergens are listed for " + d.name + ", so nothing on your allergy list conflicts.";
    } else if (/\bprotein\b/.test(t)) first = d.name + " has " + d.protein + " g of protein per serving.";
    else if (/\b(calories?|kcal|energy)\b/.test(t)) first = d.name + " has about " + d.kcal + " kcal per serving.";
    else if (/\b(price|cost|costs|magkano|how much is|how much does)\b/.test(t)) first = d.name + " costs P" + d.price + " on the board.";
    else first = d.name + ": P" + d.price + ", " + d.kcal + " kcal, " + d.protein + " g protein.";
    var parts2 = [T(first), R(dishRows(d))];
    if (bad2.length && first.indexOf("allergy list") < 0) parts2.push(T("Heads up: it lists " + joinList(bad2) + ", which is on your allergy list."));
    if (/\b(afford|enough|budget)\b/.test(t)) {
      var st = dayState(env.prof);
      parts2.push(T("You have P" + Math.max(0, st.left) + " left today, so it " + (d.price <= st.left ? "fits." : "does not fit.")));
    }
    var cn = conditionNote(d, env.prof);
    if (cn) parts2.push(T(cn));
    else if (/\bsafe\b/.test(t) && listOf(env.prof, "conditions").length) parts2.push(T("For anything about your health conditions, ask the PCU University Clinic."));
    if (!d.active) parts2.push(N("This dish is switched off on the price board right now."));
    if (!isFinite((d.src || {}).carbs)) parts2.push(N("Carbs, fat and micronutrients are not in the dish data yet."));
    if (W.NutriTipidAllergenNote) parts2.push(N(W.NutriTipidAllergenNote));
    parts2.push(N(ESTIMATE));
    return out("food", parts2, ["Why is " + d.name + " in my plan?", "High protein under P50"]);
  }

  function compare(env, a, b) {
    var rows = [a, b].map(function (d) { return [d.name, "P" + d.price + ", " + d.kcal + " kcal, " + d.protein + " g protein"]; });
    var bits = [];
    if (a.price !== b.price) {
      var c = a.price < b.price ? a : b;
      bits.push(c.name + " is P" + Math.abs(a.price - b.price) + " cheaper");
    }
    if (a.protein !== b.protein) {
      var p = a.protein > b.protein ? a : b;
      bits.push(p.name + " has " + Math.abs(a.protein - b.protein) + " g more protein");
    }
    var verdict = bits.length ? cap(bits.join(", and ") + ".") : "They match on price and protein.";
    if (a.price !== b.price && a.protein !== b.protein && (a.price < b.price) === (a.protein > b.protein)) {
      verdict = a.price < b.price ? a.name + " is cheaper and has more protein." : b.name + " is cheaper and has more protein.";
    }
    var parts = [T(a.name + " or " + b.name + "?"), R(rows), T(verdict)];
    [a, b].forEach(function (d) {
      var bad = conflicts(d.al);
      if (bad.length) parts.push(T("Heads up: " + d.name + " lists " + joinList(bad) + ", which is on your allergy list."));
    });
    parts.push(N(ESTIMATE));
    return out("compare", parts, ["Why is " + a.name + " in my plan?", "What can I afford today?"]);
  }

  var UNAVAILABLE = [
    { re: /\b(iron)\b/, label: "iron" },
    { re: /\bvitamins?\b/, label: "vitamin" },
    { re: /\b(calcium)\b/, label: "calcium" },
    { re: /\b(fiber|fibre)\b/, label: "fiber" }
  ];
  function find(env) {
    var t = env.t, i;
    for (i = 0; i < UNAVAILABLE.length; i++) {
      if (UNAVAILABLE[i].re.test(t)) {
        return out("find", [
          T("I don't have " + UNAVAILABLE[i].label + " values for each dish yet, so I can't rank dishes by it."),
          T("The board lists calories, protein and price per dish. The dashboard shows your daily micronutrients as a share of RENI."),
          N(ESTIMATE)
        ], ["High protein under P50", "What is RENI?"]);
      }
    }
    var applied = [], avoid = env.avoid.slice(), fromText = textAvoid(t);
    fromText.forEach(function (a) { if (!hit(avoid, a)) avoid.push(a); });
    var list = live(env.cat);
    var metric = "protein per peso";
    var m = /\b(under|below|less than|within|max|up to)\s*p(\d+)\b/.exec(t) || /\bp(\d+) or less\b/.exec(t);
    var mk = /\b(under|below|less than|within|max|up to)\s*(\d{2,4})\s*(kcal|calories|calorie|cals?)\b/.exec(t);
    if (mk) {
      var kcap = Number(mk[2]);
      list = list.filter(function (d) { return d.kcal <= kcap; });
      applied.push("under " + kcap + " kcal");
    }
    if (m) {
      var cap$ = Number(m[2] || m[1]);
      list = list.filter(function (d) { return d.price <= cap$; });
      applied.push("under P" + cap$);
    }
    if (/\bhigh protein\b|\bprotein\b/.test(t)) applied.push("high protein");
    if (/\b(low cal|low calorie|low calories)\b/.test(t)) { metric = "calories"; applied.push("low calorie"); }
    if (/\b(cheap|cheapest|affordable|budget friendly)\b/.test(t) && !m) { metric = "price"; applied.push("cheap"); }
    if (/\b(vegetables?|veggies?|gulay)\b/.test(t)) {
      list = list.filter(function (d) { return VEG.indexOf(d.key) >= 0; });
      applied.push("vegetable dishes");
    }
    var drop = avoid.length;
    list = list.filter(function (d) { return !conflicts(d.al, fromText).length; });
    if (drop) applied.push("no " + avoid.map(function (a) { return a.toLowerCase(); }).join(", no "));
    list.sort(function (x, y) {
      if (metric === "calories") return x.kcal - y.kcal;
      if (metric === "price") return x.price - y.price || ppp(y) - ppp(x);
      return ppp(y) - ppp(x) || x.price - y.price;
    });
    var shown = applied.length ? applied.join(", ") : "none";
    if (!list.length) {
      return out("find", [T("Nothing on the board matches those filters (" + shown + ")."), N(ESTIMATE)], ["What can I afford today?", "High protein under P50"]);
    }
    var top = list.slice(0, 3).map(function (d) {
      return d.name + ": P" + d.price + ", " + d.protein + " g protein, " + d.kcal + " kcal";
    });
    var note = (fromText.length ? "" : (env.avoid.length ? "Your profile allergens are excluded. " : "")) + "Ranked by " + metric + ".";
    return out("find", [T("Top picks. Filters: " + shown + "."), L(top), T(note), N(ESTIMATE)], ["What can I afford today?", "Am I on track?"]);
  }

  function afford(env) {
    var st = dayState(env.prof), parts = [];
    var kcalTxt = st.kcalLeft > 0 ? "about " + num(st.kcalLeft) + " kcal left of your " + num(st.target) + " target" : "reached your " + num(st.target) + " kcal target";
    if (st.left >= 0) parts.push(T("You have P" + st.left + " left today (P" + st.spent + " of P" + st.budget + " spent) and " + kcalTxt + "."));
    else parts.push(T("You are P" + (-st.left) + " over today's P" + st.budget + " budget, and have " + kcalTxt + "."));
    var fits = live(env.cat).filter(function (d) {
      return d.price <= st.left && d.kcal <= st.kcalLeft && !conflicts(d.al).length;
    }).sort(function (x, y) { return ppp(y) - ppp(x); }).slice(0, 3);
    if (fits.length) {
      parts.push(T("Dishes that fit both" + (env.avoid.length ? ", without your allergens" : "") + ":"));
      parts.push(L(fits.map(function (d) { return d.name + ": P" + d.price + ", " + d.kcal + " kcal, " + d.protein + " g protein"; })));
    } else {
      parts.push(T("Nothing on the board fits both what is left in pesos and calories. A meal packed from home costs P0, though it still counts as calories."));
    }
    parts.push(N(ESTIMATE));
    return out("afford", parts, ["High protein under P50", "Am I on track?"]);
  }

  function today(env) {
    var st = dayState(env.prof);
    var parts = [T("Today you have spent P" + st.spent + " of P" + st.budget + " and eaten " + num(st.kcal) + " of " + num(st.target) + " kcal.")];
    parts.push(R([
      ["Pesos left", st.left >= 0 ? "P" + st.left : "-P" + (-st.left)],
      ["Calories left", st.kcalLeft >= 0 ? num(st.kcalLeft) + " kcal" : "0 kcal"]
    ]));
    parts.push(A("Open dashboard", "dashboard.html"));
    return out("today", parts, ["What can I afford today?", "Am I on track?"]);
  }

  function progress(env) {
    var p = env.prof, data = weightData(), rows = data.entries;
    var goal = p && (p.goal === "lose" || p.goal === "hold" || p.goal === "gain") ? p.goal : "lose";
    var target = p && Number(p.targetKg) > 0 ? Number(p.targetKg) : Number(data.targetKg) || 0;
    var ask = /\b(when|reach|date|how long|eta)\b/.test(env.t);
    var link = A("Open Progress page", "progress.html");
    var sugs = ["What is a calorie deficit?", "What can I afford today?"];
    if (!p && !rows.length) {
      return out("progress", [T("I need your profile and a few weigh-ins to answer that. Set up your profile, then log your weight on the Progress page."), link], sugs);
    }
    var last = rows.length ? rows[rows.length - 1] : null;
    var kg = last ? last.kg : p && Number(p.weight);
    var tgtTxt = target ? r1(target) + " kg" : "your target";
    var fc = last && target ? forecast(rows, goal, target) : { ok: false };
    var rate = null, planEta = null, cp = null;
    if (p && W.NutriTipid && W.NutriTipid.planRate && kg > 0) {
      cp = {};
      for (var k in p) cp[k] = p[k];
      cp.weight = kg; cp.goal = goal;
      if (target) cp.targetKg = target;
      if (W.NutriTipid.kcalParts(cp).has) {
        rate = W.NutriTipid.planRate(cp);
        planEta = target ? W.NutriTipid.planEta(cp, last ? last.date : undefined) : null;
      }
    }
    var head, rowsOut = [];
    if (last && target && ((goal === "lose" && last.kg <= target) || (goal === "gain" && last.kg >= target))) {
      head = "Target reached. You are at " + last.kg.toFixed(1) + " kg, past your " + tgtTxt + ".";
    } else if (fc.ok) {
      var w = Math.abs(fc.weekly).toFixed(1);
      if (fc.status === "ontrack") {
        head = fc.far ? "On track, but reaching " + tgtTxt + " is more than a year away at this pace."
          : "On track. At this pace you reach " + tgtTxt + " around " + fc.eta + ".";
      } else if (fc.status === "off") head = "Off track. Your weight is moving about " + w + " kg a week away from " + tgtTxt + ".";
      else if (fc.status === "stalled") head = "Stalled. Little change in your recent weigh-ins.";
      else if (fc.status === "holding") head = "Holding steady near " + last.kg.toFixed(1) + " kg.";
      else head = "Drifting " + (fc.weekly < 0 ? "down" : "up") + " about " + w + " kg a week.";
      rowsOut.push(["Weigh-in trend", signedKg(fc.weekly)]);
    } else if (last) {
      head = "Not enough weigh-ins for a trend yet. I need at least 3 over a week or more.";
    } else {
      head = "No weigh-ins logged yet, so this is your calorie plan's estimate only.";
    }
    if (rate !== null) {
      rowsOut.push(["Plan pace", Math.abs(rate) < 0.05 ? "steady" : signedKg(rate)]);
      if (planEta && !planEta.far) {
        var pd = new Date(planEta.date + "T00:00:00");
        rowsOut.push(["Plan target date", MONTHS[pd.getMonth()] + " " + pd.getDate()]);
      } else if (planEta && planEta.far) rowsOut.push(["Plan target date", "over a year away"]);
    }
    if (last) rowsOut.unshift(["Latest weigh-in", last.kg.toFixed(1) + " kg"]);
    var parts = [T(head)];
    if (rowsOut.length) parts.push(R(rowsOut));
    if (ask && fc.ok && fc.status !== "ontrack" && planEta && !planEta.far) parts.push(T("Your calorie plan alone would reach " + tgtTxt + " around " + rowsOut[rowsOut.length - 1][1] + "."));
    parts.push(link);
    return out("progress", parts, sugs);
  }

  function fallback(env, greet) {
    var parts = [T(greet ? "Hi! I can look up dishes, check your budget, explain your plan and progress, and define nutrition terms." : "I'm not sure about that one. I can look up dishes, check your budget, explain your plan and progress, and define nutrition terms."), T("I don't give medical advice.")];
    var res = out(greet ? "greeting" : "fallback", parts, []);
    res.suggestions = STARTERS.slice();
    return res;
  }

  var WHY = /\bwhy\b|\bin my plan\b|\bexplain my plan\b|\bhow is my plan\b/;
  var FIND = /\b(protein|cheap|cheapest|affordable|iron|vitamins?|calcium|fiber|fibre|low cal|low calorie|low calories|vegetables?|veggies?|gulay|recommend|suggest|something|filling)\b|\b(under|below|less than|within|max|up to) p\d+|\bp\d+ or less|\b(under|below|less than|within|max|up to) \d{2,4} (kcal|calories|calorie|cals?)\b/;
  var AFFORD = /\b(afford|money left|budget left|pesos? left|left to spend|what can i eat|what should i eat|what to eat|can i still eat)\b/;
  var TODAY = /\b(calories left|kcal left|calories do i have|how many calories|how much did i spend|how much have i spent|spent today|spending today|calories today|eaten today|calorie target|daily target|my budget today)\b/;
  var PROGRESS = /\b(on track|when will i|reach|target|progress|weight|weigh|goal|trend|how am i doing)\b/;

  function rules(text) {
    var raw = String(text == null ? "" : text).slice(0, 200);
    var t = norm(raw);
    var env = { raw: raw, t: t, prof: profile(), cat: catalogue() };
    env.avoid = W.NutriTipid && W.NutriTipid.allergies ? W.NutriTipid.allergies() : [];
    if (!t) return fallback(env, false);
    var low = lowCal(t);
    if (low || MED.some(function (re) { return re.test(t); })) return medical(low);
    var term = termFor(t);
    if (term && /\b(what is|what s|what are|whats|define|meaning|explain|what does|how does|how do|how is)\b/.test(t) && !/\bmy plan\b/.test(t)) return explain(env, term);
    var dishes = findDishes(t, env.cat);
    if (WHY.test(t)) return why(env, dishes);
    var real = dishes.filter(function (h) { return h.dish; });
    if (real.length >= 2) return compare(env, real[0].dish, real[1].dish);
    if (dishes.length) return food(env, dishes[0]);
    if (/\bsinigang\b/.test(t)) {
      var opts = env.cat.filter(function (d) { return norm(d.name).indexOf("sinigang") >= 0; });
      if (opts.length) return out("food", [T("Which sinigang do you mean?")], opts.slice(0, 2).map(function (d) { return "How much protein is in " + d.name + "?"; }));
    }
    if (FIND.test(t)) return find(env);
    if (AFFORD.test(t)) return afford(env);
    if (TODAY.test(t)) return today(env);
    if (PROGRESS.test(t)) return progress(env);
    if (term) return explain(env, term);
    if (/^(hi|hello|hey|hola|kumusta|good (morning|afternoon|evening))\b/.test(t) && t.length < 25) return fallback(env, true);
    return fallback(env, false);
  }

  var engine = { answer: rules };
  var api = {
    answer: function (text, ctx) { return engine.answer(text, ctx); },
    setEngine: function (e) { if (e && typeof e.answer === "function") engine = e; },
    starters: STARTERS.slice()
  };
  W.NutriTipidAssistant = api;

  /* ---- panel ---- */
  if (typeof document === "undefined" || !document.createElement) return;
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(paths, size) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", size);
    s.setAttribute("height", size);
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.setAttribute("aria-hidden", "true");
    paths.forEach(function (d) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      s.appendChild(p);
    });
    return s;
  }

  function build() {
    if (document.getElementById("naLauncher")) return;
    var reduced = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var launcher = el("button", "na-launcher");
    launcher.type = "button";
    launcher.id = "naLauncher";
    launcher.setAttribute("aria-label", "Open NutriTipid Assistant");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "naPanel");
    launcher.appendChild(icon(["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"], 22));

    var panel = el("section", "na-panel");
    panel.id = "naPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "NutriTipid Assistant");
    panel.setAttribute("aria-hidden", "true");

    var head = el("div", "na-head");
    head.appendChild(el("h2", "na-title", "NutriTipid Assistant"));
    var acts = el("div", "na-actions");
    var expand = el("button", "na-textbtn na-expand", "Expand");
    expand.type = "button";
    var close = el("button", "na-textbtn", "Close");
    close.type = "button";
    acts.appendChild(expand);
    acts.appendChild(close);
    head.appendChild(acts);

    var log = el("div", "na-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");

    var form = el("form", "na-form");
    form.setAttribute("autocomplete", "off");
    var label = el("label", "na-sr", "Ask NutriTipid Assistant");
    label.setAttribute("for", "naInput");
    var input = el("input", "na-input");
    input.id = "naInput";
    input.type = "text";
    input.maxLength = 200;
    input.placeholder = "Ask about a dish, your budget, or your progress";
    var send = el("button", "na-send");
    send.type = "submit";
    send.setAttribute("aria-label", "Send");
    send.appendChild(icon(["M12 19V5", "M5 12l7-7 7 7"], 18));
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(send);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(form);
    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var sugBox = null;
    function toBottom(node) {
      log.scrollTop = node ? Math.max(0, node.offsetTop - 8) : log.scrollHeight;
    }
    function clearSugs() {
      if (sugBox && sugBox.parentNode) sugBox.parentNode.removeChild(sugBox);
      sugBox = null;
    }
    function sugs(list) {
      clearSugs();
      if (!list || !list.length) return;
      sugBox = el("div", "na-sugs");
      list.forEach(function (s) {
        var b = el("button", "na-sug", s);
        b.type = "button";
        b.addEventListener("click", function () { ask(s); input.focus(); });
        sugBox.appendChild(b);
      });
      log.appendChild(sugBox);
    }
    function addUser(text) {
      var m = el("div", "na-msg na-user");
      m.appendChild(el("div", "na-bubble", text));
      log.appendChild(m);
      toBottom();
    }
    function fill(bubble, parts) {
      parts.forEach(function (p) {
        var n;
        if (p.type === "list") {
          n = el("ul", "na-list");
          p.items.forEach(function (it) { n.appendChild(el("li", null, it)); });
        } else if (p.type === "rows") {
          n = el("div", "na-rows");
          p.rows.forEach(function (r) {
            var row = el("div", "na-row");
            row.appendChild(el("span", null, r[0]));
            row.appendChild(el("b", null, r[1]));
            n.appendChild(row);
          });
        } else if (p.type === "link") {
          n = el("a", "na-link", p.text);
          n.href = p.href;
        } else {
          n = el("p", p.type === "note" ? "na-note" : "na-p", p.text);
        }
        bubble.appendChild(n);
      });
    }
    function addBot(res) {
      var m = el("div", "na-msg na-bot");
      var b = el("div", "na-bubble");
      fill(b, res && res.parts ? res.parts : [{ type: "text", text: "Something went wrong. Please try again." }]);
      m.appendChild(b);
      log.appendChild(m);
      sugs(res && res.suggestions);
      toBottom(m);
    }
    function ask(text, instant) {
      text = String(text || "").replace(/\s+/g, " ").trim().slice(0, 200);
      if (!text) return;
      clearSugs();
      addUser(text);
      var typing = el("div", "na-typing", "...");
      log.appendChild(typing);
      toBottom();
      function done(res) {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        addBot(res);
      }
      function run() {
        var res;
        try { res = api.answer(text, { page: W.location ? W.location.pathname : "" }); } catch (e) { res = null; }
        if (res && typeof res.then === "function") res.then(done, function () { done(null); });
        else done(res);
      }
      if (instant) run(); else setTimeout(run, reduced ? 0 : 400);
    }

    var welcome = el("div", "na-msg na-bot");
    var wb = el("div", "na-bubble");
    wb.appendChild(el("p", "na-p", "Hi! I can look up dishes, check your budget, explain your plan and progress, and define nutrition terms. I don't give medical advice."));
    welcome.appendChild(wb);
    log.appendChild(welcome);
    sugs(STARTERS);

    var isOpen = false;
    function openPanel() {
      isOpen = true;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      launcher.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("na-lock");
      input.focus();
    }
    function closePanel(refocus) {
      isOpen = false;
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      launcher.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("na-lock");
      if (refocus !== false) launcher.focus();
    }
    launcher.addEventListener("click", function () { if (isOpen) closePanel(); else openPanel(); });
    close.addEventListener("click", function () { closePanel(); });
    expand.addEventListener("click", function () {
      var wide = panel.classList.toggle("is-wide");
      expand.textContent = wide ? "Shrink" : "Expand";
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = "";
      ask(v);
      input.focus();
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePanel();
        return;
      }
      if (e.key === "Tab" && W.innerWidth < 640) {
        var items = Array.prototype.filter.call(panel.querySelectorAll("button, input, a"), function (n) { return n.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });

    api.open = openPanel;
    api.close = closePanel;
    api.send = ask;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
