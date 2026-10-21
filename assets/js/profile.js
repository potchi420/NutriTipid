/* Shared profile helpers, no framework. One source of truth for the
   calorie target and the allergy list so the profiler, planner,
   dashboard, and progress pages never drift apart. */
(function () {
  "use strict";

  function readProfile() {
    try {
      var v = JSON.parse(localStorage.getItem("nutritipid-profile") || "null");
      if (v && typeof v === "object") return v;
    } catch (e) {}
    return null;
  }

  /* Calorie goal: Mifflin-St Jeor BMR x activity, with a gentle goal
     factor (lose 0.9 / hold 1.0 / gain 1.1), rounded to 50 kcal and
     clamped to a sane band. No saved profile falls back to 1,500 so
     every sample page keeps its coherent mock story. Pages that need
     a live preview (profiler) pass their own source object. */
  function kcalTarget(src) {
    var p = src || readProfile();
    if (!p) return 1500;
    var w = Number(p.weight);
    var h = Number(p.height);
    var a = Number(p.age);
    if (!(w > 0) || !(h > 0) || !(a > 0)) return 1500;
    var sex = p.sex;
    var bmr = 10 * w + 6.25 * h - 5 * a + (sex === "M" ? 5 : sex === "F" ? -161 : -78);
    var act = parseFloat(p.activity) || 1.2;
    var f = p.goal === "gain" ? 1.1 : p.goal === "hold" ? 1 : 0.9;
    var t = Math.round(bmr * act * f / 50) * 50;
    if (t < 1200) t = 1200;
    if (t > 2500) t = 2500;
    return t;
  }

  /* Active allergies as stored labels ("None" never counts). */
  function allergies() {
    var p = readProfile();
    if (!p || !Array.isArray(p.allergies)) return [];
    return p.allergies.filter(function (v) { return v && v !== "None"; });
  }

  window.NutriTipid = { kcalTarget: kcalTarget, allergies: allergies };
})();
