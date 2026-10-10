/* Shared theme toggle for app pages. Same storage key as the landing. */
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
  if (btn) {
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("nutritipid-theme", next); } catch (e) {}
      paint(next);
    });
  }
})();
