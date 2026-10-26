/* Clinic viewer mock data: deterministic patients + access log, shaped
   after AppUsers/UserProfile/MealPlan/IntakeLog/ProgressLog/AccessLog.
   Four weeks of intake rows per patient so the report can show
   consistency across weeks; Maria resolves real local data when it
   lives in this browser; the rest are fixed samples. */
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

  var COLORS = {
    maria: "#1F9D55", juan: "#3E8E7E", andrea: "#B7791F", marco: "#5F6F65",
    carla: "#4C7A45", bea: "#7A4A21", nico: "#A34A24", liza: "#4A7E96", rico: "#5F6F65"
  };
  var HEIGHTS = { maria: 164, juan: 172, andrea: 158, carla: 165, bea: 158, nico: 170, liza: 158 };
  var BUDGETS = { juan: 85, andrea: 75, carla: 90, bea: 75, nico: 120, liza: 85 };
  var KCAL_GOALS = { juan: 1600, andrea: 1400, carla: 1600, bea: 1400, nico: 1600, liza: 1700 };
  var PROTEIN_GOAL = 60;
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  /* Four weeks of intake rows: [kcal, spent, protein] x 7 days.
     Week 4 is the week the Progress page shows, so Maria's report and
     her own dashboards always agree. */
  var WEEKS = {
    maria: [
      { label: "Week of Sep 1", rows: [[1500, 90, 58], [1580, 95, 60], [1450, 92, 54], [1600, 94, 66], [1400, 88, 58], [1650, 112, 63], [1520, 93, 61]] },
      { label: "Week of Sep 8", rows: [[1540, 94, 60], [1560, 96, 61], [1490, 95, 55], [1620, 95, 65], [1440, 90, 59], [1700, 116, 64], [1550, 94, 62]] },
      { label: "Week of Sep 15", rows: [[1520, 92, 61], [1590, 96, 62], [1470, 96, 56], [1650, 96, 67], [1420, 88, 60], [1710, 117, 65], [1560, 95, 63]] },
      { label: "Week of Sep 22", rows: [[1540, 92, 61], [1610, 98, 62], [1480, 100, 55], [1660, 96, 68], [1430, 89, 60], [1720, 118, 66], [1580, 96, 63]] }
    ],
    juan: [
      { label: "Week of Sep 1", rows: [[1400, 70, 52], [1460, 75, 58], [1400, 78, 50], [1520, 88, 60], [1360, 68, 47], [1560, 92, 62], [1430, 72, 55]] },
      { label: "Week of Sep 8", rows: [[1420, 70, 53], [1480, 76, 59], [1410, 79, 51], [1540, 90, 61], [1370, 69, 48], [1580, 94, 63], [1450, 73, 56]] },
      { label: "Week of Sep 15", rows: [[1440, 71, 54], [1490, 77, 60], [1420, 80, 52], [1550, 91, 62], [1380, 69, 49], [1590, 94, 64], [1460, 73, 57]] },
      { label: "Week of Sep 22", rows: [[1450, 71, 55], [1500, 78, 60], [1420, 80, 52], [1560, 92, 62], [1380, 69, 49], [1600, 95, 64], [1470, 74, 57]] }
    ],
    andrea: [
      { label: "Week of Sep 1", rows: [[1280, 66, 46], [1250, 70, 50], [1330, 68, 42], [1260, 72, 54], [1300, 64, 48], [1220, 71, 56], [1320, 73, 52]] },
      { label: "Week of Sep 8", rows: [[1290, 67, 47], [1260, 71, 51], [1340, 69, 43], [1280, 73, 55], [1310, 65, 49], [1230, 72, 57], [1340, 74, 53]] },
      { label: "Week of Sep 15", rows: [[1300, 68, 48], [1270, 71, 52], [1350, 70, 44], [1290, 74, 56], [1320, 66, 50], [1240, 73, 58], [1340, 74, 54]] },
      { label: "Week of Sep 22", rows: [[1310, 68, 48], [1280, 72, 52], [1360, 70, 44], [1290, 74, 56], [1330, 66, 50], [1240, 73, 58], [1350, 75, 54]] }
    ],
    carla: [
      { label: "Week of Sep 1", rows: [[1560, 82, 60], [1600, 85, 63], [1530, 86, 59], [1620, 87, 65], [1500, 80, 60], [1660, 93, 64], [1580, 85, 62]] },
      { label: "Week of Sep 8", rows: [[1570, 83, 61], [1610, 85, 63], [1540, 87, 59], [1630, 88, 65], [1510, 81, 61], [1670, 94, 64], [1590, 86, 62]] },
      { label: "Week of Sep 15", rows: [[1580, 83, 61], [1610, 86, 63], [1540, 88, 60], [1630, 88, 66], [1520, 82, 61], [1670, 94, 65], [1590, 86, 63]] },
      { label: "Week of Sep 22", rows: [[1580, 84, 62], [1620, 86, 64], [1550, 88, 60], [1640, 89, 66], [1520, 82, 61], [1680, 95, 65], [1600, 87, 63]] }
    ],
    bea: [
      { label: "Week of Sep 1", rows: [[1260, 71, 42], [1240, 73, 44], [1290, 72, 40], [1270, 73, 46], [1230, 70, 43], [1220, 73, 45], [1300, 74, 44]] },
      { label: "Week of Sep 8", rows: [[1270, 71, 43], [1250, 73, 45], [1300, 72, 41], [1280, 74, 47], [1240, 71, 44], [1230, 73, 46], [1310, 74, 45]] },
      { label: "Week of Sep 15", rows: [[1280, 72, 43], [1260, 74, 45], [1310, 73, 41], [1290, 74, 47], [1250, 71, 44], [1240, 74, 46], [1320, 75, 45]] },
      { label: "Week of Sep 22", rows: [[1290, 72, 44], [1270, 74, 46], [1320, 73, 42], [1300, 74, 48], [1260, 71, 45], [1250, 74, 47], [1330, 75, 46]] }
    ],
    nico: [
      { label: "Week of Sep 1", rows: [[1670, 110, 64], [1620, 108, 62], [1690, 113, 60], [1660, 111, 65], [1650, 109, 63], [1720, 117, 66], [1630, 110, 64]] },
      { label: "Week of Sep 8", rows: [[1680, 111, 65], [1630, 109, 63], [1700, 114, 61], [1670, 112, 66], [1660, 110, 64], [1730, 118, 67], [1640, 111, 65]] },
      { label: "Week of Sep 15", rows: [[1690, 111, 65], [1640, 110, 63], [1710, 114, 62], [1680, 112, 66], [1670, 110, 64], [1740, 118, 67], [1650, 111, 65]] },
      { label: "Week of Sep 22", rows: [[1700, 112, 66], [1650, 110, 64], [1720, 115, 62], [1690, 113, 67], [1680, 111, 65], [1750, 119, 68], [1660, 112, 66]] }
    ],
    liza: [
      { label: "Week of Sep 1", rows: [[1600, 76, 56], [1630, 78, 58], [1580, 75, 54], [1640, 79, 60], [1560, 73, 55], [1670, 82, 61], [1620, 77, 58]] },
      { label: "Week of Sep 8", rows: [[1610, 77, 56], [1640, 79, 59], [1590, 76, 55], [1650, 80, 61], [1570, 74, 56], [1680, 83, 62], [1630, 78, 59]] },
      { label: "Week of Sep 15", rows: [[1620, 77, 57], [1650, 80, 60], [1600, 76, 56], [1660, 80, 61], [1580, 75, 57], [1690, 83, 62], [1640, 78, 59]] },
      { label: "Week of Sep 22", rows: [[1620, 78, 58], [1650, 80, 60], [1600, 77, 56], [1660, 81, 62], [1580, 75, 57], [1690, 84, 63], [1640, 79, 60]] }
    ]
  };

  /* Generated 7-day plans: campus slots lunch, dinner, snack
     (breakfast is from home at P0). Names + prices from the board. */
  var PLANS = {
    maria: [
      ["Ginisang Monggo", "Chicken Adobo", "Lugaw"],
      ["Chicken Tinola", "Adobong Kangkong", "Arroz caldo w/ egg"],
      ["Chicken Adobo", "Fried egg, half rice", "Lugaw"],
      ["Pork Menudo", "Adobong Kangkong", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Fried egg, half rice"],
      ["Pork Menudo", "Pork Sinigang", "Arroz caldo w/ egg"],
      ["Chicken Tinola", "Ginisang Monggo", "Lugaw"]
    ],
    juan: [
      ["Chop Suey", "Adobong Kangkong", "Fried egg, half rice"],
      ["Chicken Adobo", "Adobong Kangkong", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Arroz caldo w/ egg"],
      ["Pork Menudo", "Chicken Tinola", "Fried egg, half rice"],
      ["Chop Suey", "Adobong Kangkong", "Lugaw"],
      ["Beef Caldereta", "Chop Suey", "Arroz caldo w/ egg"],
      ["Chicken Adobo", "Ginisang Monggo", "Fried egg, half rice"]
    ],
    andrea: [
      ["Chop Suey", "Adobong Kangkong", "Lugaw"],
      ["Adobong Kangkong", "Chop Suey", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Lugaw"],
      ["Adobong Kangkong", "Chop Suey", "Lugaw"],
      ["Adobong Kangkong", "Ginisang Monggo", "Lugaw"],
      ["Adobong Kangkong", "Chop Suey", "Fried egg, half rice"],
      ["Chop Suey", "Adobong Kangkong", "Lugaw"]
    ],
    carla: [
      ["Chicken Adobo", "Adobong Kangkong", "Lugaw"],
      ["Chicken Tinola", "Adobong Kangkong", "Fried egg, half rice"],
      ["Pork Menudo", "Adobong Kangkong", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Arroz caldo w/ egg"],
      ["Chicken Adobo", "Chop Suey", "Lugaw"],
      ["Pork Sinigang", "Adobong Kangkong", "Lugaw"],
      ["Chicken Tinola", "Adobong Kangkong", "Lugaw"]
    ],
    bea: [
      ["Chop Suey", "Adobong Kangkong", "Lugaw"],
      ["Adobong Kangkong", "Chop Suey", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Lugaw"],
      ["Adobong Kangkong", "Chop Suey", "Lugaw"],
      ["Chop Suey", "Adobong Kangkong", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Lugaw"],
      ["Adobong Kangkong", "Chop Suey", "Lugaw"]
    ],
    nico: [
      ["Beef Caldereta", "Pork Menudo", "Lugaw"],
      ["Pork Sinigang", "Chicken Adobo", "Fried egg, half rice"],
      ["Chicken Tinola", "Pork Menudo", "Lugaw"],
      ["Beef Caldereta", "Chicken Adobo", "Lugaw"],
      ["Pork Menudo", "Chicken Adobo", "Fried egg, half rice"],
      ["Pork Sinigang", "Beef Caldereta", "Lugaw"],
      ["Chicken Adobo", "Chicken Tinola", "Arroz caldo w/ egg"]
    ],
    liza: [
      ["Chicken Adobo", "Adobong Kangkong", "Lugaw"],
      ["Chicken Tinola", "Adobong Kangkong", "Lugaw"],
      ["Pork Menudo", "Adobong Kangkong", "Lugaw"],
      ["Adobong Kangkong", "Chicken Adobo", "Lugaw"],
      ["Ginisang Monggo", "Adobong Kangkong", "Fried egg, half rice"],
      ["Beef Caldereta", "Adobong Kangkong", "Lugaw"],
      ["Pork Menudo", "Adobong Kangkong", "Lugaw"]
    ]
  };

  /* Prices: canteen board, SRP rounding to fives. */
  var PRICE = {
    "Lugaw": 15, "Arroz caldo w/ egg": 30, "Fried egg, half rice": 20,
    "Chicken Tinola": 45, "Chicken Adobo": 40, "Pork Menudo": 45,
    "Pork Sinigang": 50, "Ginisang Monggo": 35, "Adobong Kangkong": 25,
    "Beef Caldereta": 55, "Chop Suey": 35
  };

  /* Weigh-ins across the month, oldest to newest. */
  var WEIGHTS = {
    maria: [["Sep 1", 72.5], ["Sep 5", 72.1], ["Sep 10", 71.8], ["Sep 15", 71.0], ["Sep 22", 70.6], ["Sep 29", 69.8]],
    juan: [["Sep 2", 66.8], ["Sep 9", 66.2], ["Sep 16", 66.0], ["Sep 23", 65.7], ["Sep 29", 65.9]],
    andrea: [["Sep 1", 58.4], ["Sep 8", 58.1], ["Sep 15", 57.9], ["Sep 22", 57.7], ["Sep 28", 57.6]],
    carla: [["Sep 2", 63.0], ["Sep 9", 62.6], ["Sep 16", 62.4], ["Sep 23", 62.1], ["Sep 29", 61.9]],
    bea: [["Sep 3", 61.2], ["Sep 10", 60.9], ["Sep 17", 60.8], ["Sep 24", 60.7], ["Sep 29", 60.8]],
    nico: [["Sep 1", 74.2], ["Sep 8", 74.0], ["Sep 15", 73.9], ["Sep 22", 73.7], ["Sep 29", 73.6]],
    liza: [["Sep 1", 46.8], ["Sep 8", 46.9], ["Sep 15", 47.1], ["Sep 22", 47.2], ["Sep 29", 47.3]]
  };

  function monthYear() {
    var d = new Date();
    var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return M[d.getMonth()] + " " + d.getFullYear();
  }

  function summarize(rows, budget, kcalTarget, proteinGoal) {
    var n = rows.length;
    var spend = 0, kcal = 0, prot = 0, within = 0, hits = 0;
    rows.forEach(function (r) {
      spend += r.spent; kcal += r.kcal; prot += r.protein;
      if (r.spent <= budget) within++;
      if (r.protein >= proteinGoal) hits++;
    });
    return {
      n: n,
      withinBudget: within,
      avgSpend: Math.round(spend / n),
      avgKcal: Math.round(kcal / n),
      kcalPct: Math.round(kcal / (n * kcalTarget) * 100),
      proteinHits: hits,
      avgProtein: Math.round(prot / n),
      budgetPct: Math.round(within / n * 100),
      proteinPct: Math.round(hits / n * 100)
    };
  }

  /* Maria binds to the real browser data: profile + tracker weight +
     kcal target + logged extras. Fallbacks keep her card intact on a
     fresh browser. */
  function foldIntake(rows) {
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
            if (!rows[day]) return;
            rows[day].spent += extra.p;
            rows[day].kcal += extra.k;
          });
        });
      });
    } catch (e) {}
  }

  function buildPatient(id, name, email, consented) {
    var budget = BUDGETS[id] || 100;
    var kcalGoal = KCAL_GOALS[id] || 1500;
    var h = HEIGHTS[id] || 165;
    var weights = (WEIGHTS[id] || []).map(function (w) { return { label: w[0], kg: w[1] }; });
    var weeks = (WEEKS[id] || []).map(function (w) {
      var rows = w.rows.map(function (r, di) { return { day: DAYS[di], kcal: r[0], spent: r[1], protein: r[2] }; });
      var plan = PLANS[id].map(function (dishes, i) {
        var total = dishes.reduce(function (t, n) { return t + (PRICE[n] || 0); }, 0);
        return { day: DAYS[i], dishes: dishes, total: total };
      });
      return { label: w.label, rows: rows, plan: plan, summary: summarize(rows, budget, kcalGoal, PROTEIN_GOAL) };
    });
    var latest = weeks[weeks.length - 1];
    var latestKg = weights.length ? weights[weights.length - 1].kg : 0;
    var p = {
      id: id,
      name: name,
      email: email,
      consented: !!consented,
      initials: name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(),
      color: COLORS[id] || "#5F6F65",
      budget: budget,
      kcalTarget: kcalGoal,
      proteinGoal: PROTEIN_GOAL,
      height: h,
      weight: weights,
      weeks: weeks
    };
    if (latest) {
      p.rows = latest.rows;
      p.plan = latest.plan;
      p.summary = latest.summary;
    }
    if (bmiCheck(latestKg, h)) {
      p.bmi = Math.round((latestKg / Math.pow(h / 100, 2)) * 10) / 10;
      p.bmiCat = p.bmi < 18.5 ? ["Underweight", "is-warn"] : p.bmi < 25 ? ["Normal", "is-ok"] : p.bmi < 30 ? ["Overweight", "is-warn"] : ["Obese", "is-alert"];
    }
    p.weightDelta = weights.length >= 2 ? Math.round((weights[weights.length - 1].kg - weights[0].kg) * 10) / 10 : 0;
    p.since = monthYear();
    return p;
  }
  function bmiCheck(kg, h) { return kg > 0 && h > 0; }

  function resolveMaria(p) {
    var profile = readJson("nutritipid-profile", null);
    var weightStore = readJson("nutritipid-weight", null);
    var height = profile && typeof profile.height === "number" ? profile.height : HEIGHTS.maria;
    p.budget = profile && typeof profile.budget === "number" ? Math.round(profile.budget) : 100;
    p.kcalTarget = window.NutriTipid ? NutriTipid.kcalTarget() : 1500;
    if (weightStore && Array.isArray(weightStore.entries) && weightStore.entries.length) {
      var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      p.weight = weightStore.entries.slice(-6).map(function (en) {
        var label = String(en.label || en.date || "");
        var d = new Date(label);
        if (!isNaN(d.getTime()) && label.indexOf("-") >= 0) label = M[d.getMonth()] + " " + d.getDate();
        return { label: label, kg: Number(en.kg) };
      });
    }
    var latestKg = p.weight.length ? p.weight[p.weight.length - 1].kg : 0;
    if (latestKg > 0) {
      var hh = height > 0 ? height : HEIGHTS.maria;
      p.bmi = Math.round((latestKg / Math.pow(hh / 100, 2)) * 10) / 10;
      p.bmiCat = p.bmi < 18.5 ? ["Underweight", "is-warn"] : p.bmi < 25 ? ["Normal", "is-ok"] : p.bmi < 30 ? ["Overweight", "is-warn"] : ["Obese", "is-alert"];
    }
    p.weightDelta = p.weight.length >= 2 ? Math.round((p.weight[p.weight.length - 1].kg - p.weight[0].kg) * 10) / 10 : 0;
    /* Logged extras from the dashboard fold into the latest week. */
    foldIntake(p.rows);
    p.weeks.forEach(function (w) {
      w.summary = summarize(w.rows, p.budget, p.kcalTarget, p.proteinGoal);
    });
    p.summary = p.weeks[p.weeks.length - 1].summary;
    return p;
  }

  function patients() {
    var maria = buildPatient("maria", "Maria Santos", "maria@example.com", true);
    var acc = readJson("nutritipid-account", null);
    if (acc && /^maria/i.test(acc.email || "") && acc.name) maria.name = acc.name;
    resolveMaria(maria);
    return [
      maria,
      buildPatient("juan", "Juan Dela Cruz", "juan@example.com", true),
      buildPatient("andrea", "Andrea Lim", "andrea@example.com", true),
      buildPatient("carla", "Carla Mendez", "carla@example.com", true),
      buildPatient("bea", "Bea Torres", "bea@example.com", true),
      buildPatient("nico", "Nico Reyes", "nico@example.com", true),
      buildPatient("liza", "Liza Santos", "liza@example.com", true),
      buildPatient("marco", "Marco Reyes", "marco@example.com", false),
      buildPatient("rico", "Rico Cruz", "rico@example.com", false)
    ];
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
