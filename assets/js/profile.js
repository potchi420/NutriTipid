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
    var bmr = 10 * w + 6.25 * h - 5 * a + (sex === "M" ? 5 : sex === "F" ? -161 : -78);
    var tdee = bmr * (parseFloat(p.activity) || 1.2);
    var target = p.goal === "gain" ? tdee + 300 : p.goal === "hold" ? tdee : tdee - 300;
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

  window.NutriTipid = { kcalTarget: kcalTarget, kcalParts: kcalParts, allergies: allergies };

  /* allergy labels currently in effect, "None" never counts
   */
  function allergies() {
    var p = readProfile();
    if (!p || !Array.isArray(p.allergies)) return [];
    return p.allergies.filter(function (v) { return v && v !== "None"; });
  }
})();
