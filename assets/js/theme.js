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

  /* Account dropdown: profile, theme, log out. Closes on outside
     click, Escape, and after following a link. */
  var menuBtn = document.getElementById("userBtn");
  var panel = document.getElementById("userPanel");
  function setMenu(open) {
    if (!panel || !menuBtn) return;
    panel.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenu(!panel.classList.contains("is-open"));
    });
    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("is-open")) return;
      if (panel.contains(e.target) || menuBtn.contains(e.target)) return;
      setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !panel.classList.contains("is-open")) return;
      setMenu(false);
      menuBtn.focus();
    });
    Array.prototype.forEach.call(panel.querySelectorAll('a[role="menuitem"]'), function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* avatar letters come from the signed-in name, static markup is only
     the logged-out fallback */
  var avatar = document.querySelector(".user-avatar");
  var me = null;
  try { me = JSON.parse(localStorage.getItem("nutritipid-account") || "null"); } catch (e) {}
  if (avatar && me) {
    var words = String(me.name || "").trim().split(/\s+/).filter(Boolean);
    if (words.length) {
      avatar.textContent = words.slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
    }
  }

  /* Logged in, the logo goes back into the app instead of the landing
     page. Signed out, it keeps pointing at the landing page. */
  var brand = document.querySelector(".brand");
  var appShell = document.querySelector(".user-menu") || document.body.hasAttribute("data-app");
  if (brand && me && appShell) {
    var home = me.role === "admin" ? "admin.html" : me.role === "clinic" ? "clinic.html" : "dashboard.html";
    brand.setAttribute("href", home);
    brand.setAttribute("aria-label", home === "dashboard.html" ? "NutriTipid dashboard" : "NutriTipid home");
  }
})();
