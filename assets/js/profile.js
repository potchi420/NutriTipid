/* shared profile helpers, one source of truth for the kcal target and
   allergy list so pages cant drift apart
   */
(function () {
  "use strict";

  function readProfile() {
    try {
      var v = JSON.parse(localStorage.getItem("nutritipid-profile") || "null");
      if (v && typeof v === "object") return v;
    } catch (e) {}
    return null;
  }

  /* mifflin-st jeor BMR x activity, then a goal step in the locked 300-500
     band (lose -300, hold 0, gain +300), rounded to 50, clamped 1200-2500.
     no profile saved = 1,500, every sample page's math is built on that
     number so dont casually change it. kcalParts() has the breakdown
   */
  function kcalParts(src) {
    var empty = { bmr: 0, tdee: 0, target: 1500, deficit: 0, has: false };
    var p = src || readProfile();
    if (!p) return empty;
    var w = Number(p.weight);
    var h = Number(p.height);
    var a = Number(p.age);
    if (!(w > 0) || !(h > 0) || !(a > 0)) return empty;
    var sex = p.sex;
    /* goal stays authoritative, targetKg only fills in when it is missing */
    var goal = p.goal;
    if (!goal && Number(p.targetKg) > 0) goal = goalFromTarget(w, Number(p.targetKg));
    var bmr = 10 * w + 6.25 * h - 5 * a + (sex === "M" ? 5 : sex === "F" ? -161 : -78);
    var tdee = bmr * (parseFloat(p.activity) || 1.2);
    var target = goal === "gain" ? tdee + 300 : goal === "hold" ? tdee : tdee - 300;
    target = Math.round(target / 50) * 50;
    if (target < 1200) target = 1200;
    if (target > 2500) target = 2500;
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target: target,
      deficit: Math.round(tdee) - target,
      has: true
    };
  }

  function kcalTarget(src) {
    return kcalParts(src).target;
  }

  /* BMI 18.5 to 24.9 as kg for a height, rounded to 0.1
   */
  function round1(n) {
    return Math.round(n * 10) / 10;
  }
  function healthyRange(heightCm) {
    var m = Number(heightCm) / 100;
    return { minKg: round1(18.5 * m * m), maxKg: round1(24.9 * m * m) };
  }

  /* nearest healthy weight, rounded toward the healthy side so the
     suggestion always passes the range check
   */
  function suggestTarget(weightKg, heightCm) {
    var w = Number(weightKg);
    var m = Number(heightCm) / 100;
    var r = healthyRange(heightCm);
    if (w > r.maxKg) return Math.floor(24.9 * m * m * 10 + 1e-9) / 10;
    if (w < r.minKg) return Math.ceil(18.5 * m * m * 10 - 1e-9) / 10;
    return round1(w);
  }

  function goalFromTarget(weightKg, targetKg) {
    var w = Number(weightKg);
    var t = Number(targetKg);
    if (t < w - 0.5) return "lose";
    if (t > w + 0.5) return "gain";
    return "hold";
  }

  /* kcal per kg of body weight, a rule-of-thumb approximation */
  var KCAL_PER_KG = 7700;

  /* kg per week the plan implies, negative = losing
   */
  function planRate(src) {
    var k = kcalParts(src);
    return -(k.deficit) * 7 / KCAL_PER_KG;
  }

  /* date the target is reached at that pace, from today unless fromIso is
     given. null = hold, no pace, or the pace moves away from the target
   */
  function planEta(src, fromIso) {
    var p = src || readProfile();
    if (!p) return null;
    var w = Number(p.weight);
    var t = Number(p.targetKg);
    if (!(w > 0) || !(t > 0)) return null;
    if (goalFromTarget(w, t) === "hold") return null;
    var rate = planRate(p);
    if (Math.abs(rate) < 0.02 || (t - w) * rate <= 0) return null;
    var weeks = (t - w) / rate;
    var d = fromIso ? new Date(fromIso + "T00:00:00") : new Date();
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + Math.ceil(weeks * 7));
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    var iso = d.getFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd;
    return { date: iso, weeks: Math.round(weeks * 10) / 10, far: weeks > 52 };
  }

  /* the seven general allergen groups, in display order. hints are the
     one-line help text for the pickers
   */
  var ALLERGEN_GROUPS = ["Shellfish", "Fish", "Egg", "Milk", "Peanut", "Wheat", "Soy"];
  var ALLERGEN_HINTS = {
    Shellfish: "shrimp (hipon), crab, squid, mussels (tahong), bagoong alamang, oyster sauce",
    Fish: "fish, patis (fish sauce), bagoong isda, dilis",
    Egg: "chicken egg, quail egg (itlog pugo), salted egg",
    Milk: "milk, cheese, butter, evaporated or condensed milk",
    Peanut: "peanuts, peanut sauce (kare-kare), peanut butter",
    Wheat: "bread, pancit canton/miki, breading, flour, toyo",
    Soy: "toyo (soy sauce), tokwa, taho, tausi"
  };

  /* old saved values map forward ("Shrimp" is now Shellfish). admin added
     lookups from nutritipid-allergens stay valid, anything else is dropped
   */
  function normalizeAllergens(list) {
    var known = ALLERGEN_GROUPS.slice();
    try {
      var store = JSON.parse(localStorage.getItem("nutritipid-allergens") || "null");
      if (store && Array.isArray(store.list)) {
        store.list.forEach(function (a) {
          if (typeof a === "string" && a.trim() && known.indexOf(a.trim()) < 0) known.push(a.trim());
        });
      }
    } catch (e) {}
    var res = [];
    (Array.isArray(list) ? list : []).forEach(function (v) {
      if (typeof v !== "string") return;
      var t = v.trim();
      if (!t || t.toLowerCase() === "none") return;
      if (t.toLowerCase() === "shrimp") t = "Shellfish";
      var hit = null;
      known.forEach(function (k) { if (k.toLowerCase() === t.toLowerCase()) hit = k; });
      if (hit && res.indexOf(hit) < 0) res.push(hit);
    });
    return res;
  }

  /* allergy groups currently in effect, "None" never counts
   */
  function allergies() {
    var p = readProfile();
    if (!p || !Array.isArray(p.allergies)) return [];
    return normalizeAllergens(p.allergies);
  }

  /* the user's groups that a dish carries, empty with no profile or no hit
   */
  function allergenConflicts(dishAllergens) {
    var mine = allergies();
    if (!mine.length) return [];
    var has = normalizeAllergens(dishAllergens);
    return mine.filter(function (a) { return has.indexOf(a) >= 0; });
  }

  /* one line of reason text for a blocked dish, "" when nothing conflicts
   */
  function allergenReason(conflicts) {
    if (!conflicts || !conflicts.length) return "";
    return "Contains " + conflicts.join(", ") + ", on your allergy list.";
  }

  window.NutriTipid = {
    kcalTarget: kcalTarget,
    kcalParts: kcalParts,
    allergies: allergies,
    normalizeAllergens: normalizeAllergens,
    allergenConflicts: allergenConflicts,
    allergenReason: allergenReason,
    allergenGroups: ALLERGEN_GROUPS.slice(),
    allergenHints: ALLERGEN_HINTS,
    healthyRange: healthyRange,
    suggestTarget: suggestTarget,
    goalFromTarget: goalFromTarget,
    planRate: planRate,
    planEta: planEta
  };
})();
