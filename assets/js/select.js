/* Custom select: progressive enhancement over select.auth-input.
   Native option popups cannot be styled cross-browser, so this builds
   a listbox that matches the design system. The real <select> stays
   in the DOM holding name and value; every choice syncs both ways and
   fires a bubbling change event, so existing listeners keep working.
   Keyboard: arrows navigate, Enter picks, Escape closes, letters jump.
   ES5, no framework. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var OPEN = null;

  function enhance(sel) {
    if (sel.getAttribute("data-native") !== null) return;
    var opts = Array.prototype.slice.call(sel.options);
    if (!opts.length) return;

    var wrap = document.createElement("span");
    wrap.className = "select-field";
    if (sel.parentNode.nodeName === "SPAN" && sel.parentNode.classList.contains("select-field")) {
      wrap = sel.parentNode;
    } else {
      sel.parentNode.insertBefore(wrap, sel);
      wrap.appendChild(sel);
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "select-btn" + (sel.className.indexOf("tabular") >= 0 ? " tabular" : "");
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    var lbl = document.createElement("span");
    lbl.className = "select-lbl";
    lbl.textContent = opts[sel.selectedIndex || 0].text;
    var chev = document.createElementNS(NS, "svg");
    chev.setAttribute("class", "chev");
    chev.setAttribute("width", "12");
    chev.setAttribute("height", "12");
    chev.setAttribute("viewBox", "0 0 24 24");
    chev.setAttribute("fill", "none");
    chev.setAttribute("stroke", "currentColor");
    chev.setAttribute("stroke-width", "2.5");
    chev.setAttribute("stroke-linecap", "round");
    chev.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", "m6 9 6 6 6-6");
    chev.appendChild(path);
    btn.appendChild(lbl);
    btn.appendChild(chev);
    wrap.appendChild(btn);

    sel.classList.add("select-hidden");

    var list = document.createElement("span");
    list.className = "select-list";
    list.setAttribute("role", "listbox");
    list.tabIndex = -1;
    var optEls = opts.map(function (o, i) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "select-opt";
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", i === sel.selectedIndex ? "true" : "false");
      el.textContent = o.text;
      el.dataset.i = i;
      list.appendChild(el);
      return el;
    });
    wrap.appendChild(list);

    function close() {
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      OPEN = null;
    }
    function open() {
      if (OPEN && OPEN !== close) OPEN();
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      OPEN = close;
      var cur = optEls[sel.selectedIndex || 0];
      if (cur) { cur.classList.add("is-active"); if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" }); }
    }
    function pick(i) {
      sel.selectedIndex = i;
      lbl.textContent = opts[i].text;
      optEls.forEach(function (oe, j) { oe.setAttribute("aria-selected", j === i ? "true" : "false"); });
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      btn.focus();
    }
    function move(from, step) {
      var next = Math.max(0, Math.min(opts.length - 1, from + step));
      optEls.forEach(function (oe, j) { oe.classList.toggle("is-active", j === next); });
      optEls[next].focus();
      return next;
    }

    btn.addEventListener("click", function () {
      if (wrap.classList.contains("is-open")) close();
      else open();
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!wrap.classList.contains("is-open")) open();
        move(sel.selectedIndex || 0, e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      } else if (e.key === "Escape") {
        close();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        var start = sel.selectedIndex || 0;
        for (var k = 1; k <= opts.length; k++) {
          var i = (start + k) % opts.length;
          if (opts[i].text.toLowerCase().charAt(0) === e.key.toLowerCase()) {
            if (!wrap.classList.contains("is-open")) open();
            sel.selectedIndex = i;
            lbl.textContent = opts[i].text;
            optEls.forEach(function (oe, j) { oe.setAttribute("aria-selected", j === i ? "true" : "false"); });
            var act = optEls[i]; optEls.forEach(function (oe, j) { oe.classList.toggle("is-active", j === i); });
            if (act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
            break;
          }
        }
      }
    });
    list.addEventListener("keydown", function (e) {
      var act = optEls.map(function (oe) { return oe.classList.contains("is-active"); }).indexOf(true);
      if (e.key === "ArrowDown") { e.preventDefault(); move(Math.max(0, act), 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(Math.max(0, act), -1); }
      else if (e.key === "Enter") { e.preventDefault(); pick(Math.max(0, act)); }
      else if (e.key === "Escape") { close(); btn.focus(); }
    });
    list.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".select-opt") : null;
      if (b) pick(Number(b.dataset.i));
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
    window.addEventListener("resize", close);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("select.auth-input"), enhance);
  }
})();
