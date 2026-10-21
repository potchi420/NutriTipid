/* Clinic viewer mock data: deterministic patients + access log, shaped
   after AppUsers/UserProfile/MealPlan/IntakeLog/ProgressLog/AccessLog.
   Maria resolves real local data when it lives in this browser; the
   rest are fixed samples so screenshots stay reproducible. */
(function () {
  "use strict";

  function readJson(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "null");
      if (v && typeof v !== "undefined") return v;
    } catch (e) {}
    return fallback;
  }
  function viewerName() {
    var acc = readJson("nutritipid-account", null);
    if (acc && acc.name) return acc.name;
    return "University Clinic";
  }

  var COLORS = { maria: "#1F9D55", juan: "#3E8E7E", andrea: "#B7791F", marco: "#5F6F65" };
  var HEIGHTS = { maria: 165, juan: 172, andrea: 158 };
  var PROTEIN_GOAL = 60;

  /* Week-intake mocks ("last week" log rows). Maria's rows are the same
     numbers the Progress page shows, so the clinic report and the
     student's own dashboard always agree. */
  var ROWS = {
    maria: [
      ["Mon", 1540, 92, 61], ["Tue", 1610, 98, 62], ["Wed", 1480, 100, 55],
      ["Thu", 1660, 96, 68], ["Fri", 1430, 89, 60], ["Sat", 1720, 118, 66],
      ["Sun", 1580, 96, 63]
    ],
    juan: [
      ["Mon", 1450, 71, 55], ["Tue", 1500, 78, 60], ["Wed", 1420, 80, 52],
      ["Thu", 1560, 92, 62], ["Fri", 1380, 69, 49], ["Sat", 1600, 95, 64],
      ["Sun", 1470, 74, 57]
    ],
    andrea: [
      ["Mon", 1310, 68, 48], ["Tue", 1280, 72, 52], ["Wed", 1360, 70, 44],
      ["Thu", 1290, 74, 56], ["Fri", 1330, 66, 50], ["Sat", 1240, 73, 58],
      ["Sun", 1350, 75, 54]
    ]
  };

  /* Generated 7-day plans (dish names + prices from the canteen board). */
  var PLANS = {
    maria: [
      ["Lugaw", "Ginisang Monggo", "Chicken Adobo"],
      ["Arroz caldo w/ egg", "Chicken Tinola", "Adobong Kangkong"],
      ["Fried egg, half rice", "Chicken Adobo", "Lugaw"],
      ["Lugaw", "Adobong Kangkong", "Pork Menudo"],
      ["Fried egg, half rice", "Ginisang Monggo", "Adobong Kangkong"],
      ["Arroz caldo w/ egg", "Pork Menudo", "Pork Sinigang"],
      ["Lugaw", "Chicken Tinola", "Ginisang Monggo"]
    ],
    juan: [
      ["Fried egg, half rice", "Adobong Kangkong", "Chop Suey"],
      ["Lugaw", "Chicken Adobo", "Adobong Kangkong"],
      ["Arroz caldo w/ egg", "Ginisang Monggo", "Adobong Kangkong"],
      ["Fried egg, half rice", "Pork Menudo", "Chicken Tinola"],
      ["Lugaw", "Chop Suey", "Adobong Kangkong"],
      ["Arroz caldo w/ egg", "Pork Caldereta", "Chop Suey"],
      ["Fried egg, half rice", "Chicken Adobo", "Ginisang Monggo"]
    ],
    andrea: [
      ["Lugaw", "Adobong Kangkong", "Chop Suey"],
      ["Fried egg, half rice", "Adobong Kangkong", "Chop Suey"],
      ["Lugaw", "Ginisang Monggo", "Adobong Kangkong"],
      ["Arroz caldo w/ egg", "Adobong Kangkong", "Chop Suey"],
      ["Lugaw", "Adobong Kangkong", "Ginisang Monggo"],
      ["Fried egg, half rice", "Adobong Kangkong", "Chop Suey"],
      ["Lugaw", "Chop Suey", "Adobong Kangkong"]
    ]
  };

  /* Prices: canteen board, SRP rounding to fives. */
  var PRICE = {
    "Lugaw": 15, "Arroz caldo w/ egg": 30, "Fried egg, half rice": 20,
    "Chicken Tinola": 45, "Chicken Adobo": 40, "Pork Menudo": 45,
    "Pork Sinigang": 50, "Ginisang Monggo": 35, "Adobong Kangkong": 25,
    "Pork Caldereta": 55, "Chop Suey": 35
  };

  var WEIGHTS = {
    maria: [["Sep 1", 72.5], ["Sep 5", 72.1], ["Sep 10", 71.8], ["Sep 15", 71.0], ["Sep 29", 69.8]],
    juan: [["Sep 2", 66.8], ["Sep 9", 66.2], ["Sep 16", 66.0], ["Sep 23", 65.7], ["Sep 30", 65.9]],
    andrea: [["Sep 1", 58.4], ["Sep 4", 58.1], ["Sep 10", 57.9], ["Sep 18", 57.7], ["Sep 28", 57.6]]
  };

  function monthYear() {
    var d = new Date();
    var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return M[d.getMonth()] + " " + d.getFullYear();
  }

  /* Maria binds to the real browser data: profile + tracker weight +
     kcal target. Fallbacks keep her card intact on a fresh browser. */
  function resolveMaria(base) {
    var p = base;
    var profile = readJson("nutritipid-profile", null);
    var weight = readJson("nutritipid-weight", null);
    var height = profile && typeof profile.height === "number" ? profile.height : HEIGHTS.maria;
    p.budget = profile && typeof profile.budget === "number" ? Math.round(profile.budget) : 100;
    p.kcalTarget = window.NutriTipid ? NutriTipid.kcalTarget() : 1500;
    if (weight && Array.isArray(weight.entries) && weight.entries.length) {
      var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      p.weight = weight.entries.slice(-5).map(function (en) {
        var label = String(en.label || en.date || "");
        var d = new Date(label);
        if (!isNaN(d.getTime()) && label.indexOf("-") >= 0) label = M[d.getMonth()] + " " + d.getDate();
        return { label: label, kg: Number(en.kg) };
      });
    }
    var latestKg = p.weight.length && p.weight[p.weight.length - 1].kg || 0;
    if (latestKg > 0) {
      var h = height > 0 ? height : HEIGHTS.maria;
      var bmi = latestKg / Math.pow(h / 100, 2);
      p.bmi = Math.round(bmi * 10) / 10;
      p.bmiCat = p.bmi < 18.5 ? ["Underweight", "is-warn"] : p.bmi < 25 ? ["Normal", "is-ok"] : p.bmi < 30 ? ["Overweight", "is-warn"] : ["Obese", "is-alert"];
    }
    foldIntake(p);
    return p;
  }

  /* Logged extras from the dashboard fold into the week rows. */
  function foldIntake(p) {
    try {
      var intake = readJson("nutritipid-intake", null);
      if (!intake || typeof intake !== "object") return;
      /* Same pool as the dashboard's EAT list, in the same order. */
      var EAT = [{ p: 15, k: 280 }, { p: 35, k: 520 }, { p: 40, k: 520 }, { p: 45, k: 460 }, { p: 25, k: 320 }, { p: 30, k: 420 }];
      Object.keys(intake).forEach(function (dayKey) {
        var day = Number(dayKey) % 7;
        var dayObj = intake[dayKey];
        if (!dayObj || typeof dayObj !== "object") return;
        Object.keys(dayObj).forEach(function (slot) {
          var list = dayObj[slot];
          if (!Array.isArray(list)) return;
          list.forEach(function (idx) {
            var extra = EAT[Number(idx)] || EAT[0];
            if (!p.rows[day]) return;
            p.rows[day].spent += extra.p;
            p.rows[day].kcal += extra.k;
          });
        });
      });
    } catch (e) {}
  }

  function basePatient(id, name, email, consented) {
    var rows = ROWS[id] || [];
    var plan = PLANS[id] || [];
    var weights = WEIGHTS[id] || [];
    var latestKg = weights.length ? weights[weights.length - 1][1] : 0;
    var h = HEIGHTS[id] || 165;
    var bmi = latestKg > 0 ? latestKg / Math.pow(h / 100, 2) : 0;
    var p = {
      id: id,
      name: name,
      email: email,
      consented: !!consented,
      initials: name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(),
      color: COLORS[id] || "#5F6F65",
      rows: rows.map(function (r) { return { day: r[0], kcal: r[1], spent: r[2], protein: r[3] }; }),
      plan: plan.map(function (dishes, i) {
        var names = dishes;
        var total = names.reduce(function (t, n) { return t + (PRICE[n] || 0); }, 0);
        return { day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], dishes: names, total: total };
      }),
      weight: weights.map(function (w) { return { label: w[0], kg: w[1] }; }),
      budget: id === "juan" ? 85 : id === "andrea" ? 75 : 100,
      kcalTarget: id === "juan" ? 1600 : 1400,
      proteinGoal: PROTEIN_GOAL,
      height: h
    };
    if (bmi > 0 && latestKg > 0) {
      p.bmi = Math.round(bmi * 10) / 10;
      p.bmiCat = p.bmi < 18.5 ? ["Underweight", "is-warn"] : p.bmi < 25 ? ["Normal", "is-ok"] : p.bmi < 30 ? ["Overweight", "is-warn"] : ["Obese", "is-alert"];
    }
    var wDelta = weights.length >= 2 ? Math.round((weights[weights.length - 1][1] - weights[0][1]) * 10) / 10 : 0;
    p.weightDelta = wDelta;
    p.since = monthYear();
    return p;
  }

  function summarize(p) {
    var n = p.rows.length;
    var spend = 0, kcal = 0, prot = 0, within = 0, hits = 0;
    p.rows.forEach(function (r) {
      spend += r.spent; kcal += r.kcal; prot += r.protein;
      if (r.spent <= p.budget) within++;
      if (r.protein >= p.proteinGoal) hits++;
    });
    return {
      n: n,
      withinBudget: within,
      avgSpend: Math.round(spend / n),
      avgKcal: Math.round(kcal / n),
      kcalPct: Math.round(kcal / (n * p.kcalTarget) * 100),
      proteinHits: hits,
      avgProtein: Math.round(prot / n),
      budgetPct: Math.round(within / n * 100),
      proteinPct: Math.round(hits / n * 100)
    };
  }

  function patients() {
    var maria = basePatient("maria", "Maria Santos", "maria@example.com", true);
    var acc = readJson("nutritipid-account", null);
    if (acc && /^maria/i.test(acc.email || "") && acc.name) maria.name = acc.name;
    resolveMaria(maria);
    maria.summary = summarize(maria);
    var list = [
      maria,
      basePatient("juan", "Juan Dela Cruz", "juan@example.com", true),
      basePatient("andrea", "Andrea Lim", "andrea@example.com", true),
      basePatient("marco", "Marco Reyes", "marco@example.com", false)
    ];
    list[1].summary = summarize(list[1]);
    list[2].summary = summarize(list[2]);
    return list;
  }

  function find(id) {
    var all = patients();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function logView(p) {
    if (!p || !p.consented) return;
    var store = readJson("nutritipid-accesslog", null);
    if (!store || !Array.isArray(store.entries)) {
      store = { entries: [
        { viewer: "University Clinic", patientId: "juan", patient: "Juan Dela Cruz", action: "view dashboard", at: "Sep 26, 10:12 AM" },
        { viewer: "University Clinic", patientId: "maria", patient: "Maria Santos", action: "view dashboard", at: "Sep 29, 2:35 PM" },
        { viewer: "University Clinic", patientId: "andrea", patient: "Andrea Lim", action: "view dashboard", at: "Sep 29, 3:02 PM" }
      ] };
    }
    var d = new Date();
    var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var h12 = d.getHours() % 12 || 12;
    var stamp = M[d.getMonth()] + " " + d.getDate() + ", " + h12 + ":" + ("0" + d.getMinutes()).slice(-2) + (d.getHours() < 12 ? " AM" : " PM");
    store.entries.push({
      viewer: viewerName(),
      patientId: p.id,
      patient: p.name,
      action: "view dashboard",
      at: stamp
    });
    if (store.entries.length > 30) store.entries = store.entries.slice(-30);
    try {
      localStorage.setItem("nutritipid-accesslog", JSON.stringify(store));
    } catch (e) {}
  }

  function recentLog() {
    var store = readJson("nutritipid-accesslog", null);
    var entries = store && Array.isArray(store.entries) ? store.entries : [];
    return entries.slice().reverse();
  }

  window.NutriTipidClinic = { patients: patients, find: find, logView: logView, recentLog: recentLog, viewerName: viewerName };
})();
