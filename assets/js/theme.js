/* theme toggle for app pages, same nutritipid-theme key as the landing
   */
(function () {
  "use strict";
  var root = document.documentElement;
  var btn = document.getElementById("themeBtn");
  var label = document.getElementById("themeLabel");
  var moon = document.getElementById("themeMoon");
  var sun = document.getElementById("themeSun");
  function paint(t) {
    if (label) label.textContent = t === "dark" ? "Light" : "Dark";
    if (moon) moon.classList.toggle("is-hidden", t === "dark");
    if (sun) sun.classList.toggle("is-hidden", t !== "dark");
  }
  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  paint(current());
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function swap(next) {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("nutritipid-theme", next); } catch (e) {}
    paint(next);
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      if (!reduceMotion && document.startViewTransition) {
        document.startViewTransition(function () { swap(next); });
      } else {
        swap(next);
      }
    });
  }
})();
