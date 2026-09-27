/* NutriTipid landing interactions. Plain JS, no framework. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* Theme: respect saved choice, fall back to OS setting */
  var themeBtn = document.getElementById("themeBtn");
  var themeLabel = document.getElementById("themeLabel");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("nutritipid-theme", t); } catch (e) {}
    if (themeLabel) themeLabel.textContent = t === "dark" ? "Light" : "Dark";
  }
  var saved = null;
  try { saved = localStorage.getItem("nutritipid-theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setTheme("dark");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
    });
  }

  /* Diary sample days. Prices mirror the board. Labeled as samples. */
  var thumbBase = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  function thumb(name) { return thumbBase + encodeURIComponent(name) + "?width=200"; }
  var thumbs = {
    arroz: thumb("Arroz caldo from Street Sarap at the Terminal 3 of the Ninoy Aquino International Airport (2026-01-14).jpg"),
    monggo: thumb("3778Ginisang monggo, sugpo at tokwa sa kamias 12.jpg"),
    adobo: thumb("Chicken Adobo with Potatoes.jpg"),
    tapsilog: thumb("Tapsilog in saudi arabia.jpg"),
    sinigang: thumb("Sinigang na Baboy DSCF4234.jpg"),
    gulay: thumb("Pinakbet on a white bowl.jpg"),
    champorado: thumb("Champorado with tuyo and milk (cropped top view).jpg"),
    pares: thumb("Beef Pares with Fried Rice.jpg")
  };
  var days = [
    {
      total: "P98 of P100",
      kcal: "1,420 kcal",
      rows: [
        ["Breakfast", "Arroz caldo with egg", "Ordered at the morning stall", "P35", "420 kcal", thumbs.arroz],
        ["Lunch", "Monggo with half rice", "Fiber holds hunger longer", "P38", "520 kcal", thumbs.monggo],
        ["Dinner", "Chicken adobo with half rice", "28g protein, spoon of sauce", "P25", "480 kcal", thumbs.adobo]
      ]
    },
    {
      total: "P108 of P110",
      kcal: "1,380 kcal",
      rows: [
        ["Breakfast", "Tapsilog with half rice", "Egg cooked with less oil", "P45", "510 kcal", thumbs.tapsilog],
        ["Lunch", "Sinigang with half rice", "Soup stretches one serving", "P35", "460 kcal", thumbs.sinigang],
        ["Dinner", "Ginisang gulay with half rice", "Lowest cost dinner", "P28", "410 kcal", thumbs.gulay]
      ]
    },
    {
      total: "P95 of P100",
      kcal: "1,380 kcal",
      rows: [
        ["Breakfast", "Champorado with tuyo", "Small serving, high energy", "P25", "380 kcal", thumbs.champorado],
        ["Lunch", "Pares with half rice", "Rich broth, rice split in half", "P40", "560 kcal", thumbs.pares],
        ["Dinner", "Tinola with half rice", "Clear soup with chicken", "P30", "440 kcal", thumbs.sinigang]
      ]
    }
  ];
  var mealList = document.getElementById("mealList");
  var diaryTotal = document.getElementById("diaryTotal");
  var diaryKcal = document.getElementById("diaryKcal");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".day-tab"));
  function renderDay(i) {
    var d = days[i];
    if (!mealList || !d) return;
    mealList.innerHTML = "";
    d.rows.forEach(function (r) {
      var div = document.createElement("div");
      div.className = "meal";
      var img = document.createElement("img");
      img.src = r[5]; img.alt = ""; img.loading = "lazy";
      img.onerror = function () { img.style.display = "none"; };
      var who = document.createElement("div");
      who.className = "who";
      var strong = document.createElement("strong");
      strong.textContent = r[0] + " - " + r[1];
      var note = document.createElement("span");
      note.textContent = r[2];
      who.appendChild(strong); who.appendChild(note);
      var nums = document.createElement("div");
      nums.className = "nums";
      var b = document.createElement("b");
      b.textContent = r[3];
      var k = document.createElement("span");
      k.textContent = r[4];
      nums.appendChild(b); nums.appendChild(k);
      div.appendChild(img); div.appendChild(who); div.appendChild(nums);
      mealList.appendChild(div);
    });
    if (diaryTotal) diaryTotal.textContent = d.total;
    if (diaryKcal) diaryKcal.textContent = d.kcal;
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", String(Number(t.getAttribute("data-day")) === i));
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { renderDay(Number(t.getAttribute("data-day"))); });
  });
  renderDay(0);

  /* Budget worksheet */
  var range = document.getElementById("budgetRange");
  var bVal = document.getElementById("budgetVal");
  var bVal2 = document.getElementById("budgetVal2");
  var bNote = document.getElementById("budgetNote");
  function money(n) { return "P" + n; }
  function renderBudget(v) {
    var f, l, d;
    if (v <= 85) {
      f = Math.round(v * 0.27); l = Math.round(v * 0.43); d = v - f - l;
      bNote.textContent = "At " + money(v) + ", breakfast stays light so lunch keeps protein.";
      setSplit("bFast", "bFastBar", "bFastTip", f, v, "Champorado or arroz caldo. Light and warm.");
      setSplit("bLunch", "bLunchBar", "bLunchTip", l, v, "Monggo or sinigang with half rice. Holds protein.");
      setSplit("bDinner", "bDinnerBar", "bDinnerTip", d, v, "Gulay or tinola with half rice.");
    } else if (v <= 150) {
      f = Math.round(v * 0.30); l = Math.round(v * 0.40); d = v - f - l;
      bNote.textContent = "Often split " + money(f) + ", " + money(l) + ", " + money(d) + ". The planner fills exact dishes.";
      setSplit("bFast", "bFastBar", "bFastTip", f, v, "Arroz caldo with egg.");
      setSplit("bLunch", "bLunchBar", "bLunchTip", l, v, "Monggo or sinigang with half rice.");
      setSplit("bDinner", "bDinnerBar", "bDinnerTip", d, v, "Adobo or chicken meal with half rice.");
    } else if (v <= 300) {
      f = Math.round(v * 0.31); l = Math.round(v * 0.38); d = v - f - l;
      bNote.textContent = "At " + money(v) + ", room for an egg or gulay add-on once a day, plus merienda.";
      setSplit("bFast", "bFastBar", "bFastTip", f, v, "Tapsilog with half rice and egg.");
      setSplit("bLunch", "bLunchBar", "bLunchTip", l, v, "Pares or adobo with half rice and gulay.");
      setSplit("bDinner", "bDinnerBar", "bDinnerTip", d, v, "Tinola or sinigang with half rice.");
    } else {
      f = Math.round(v * 0.33); l = Math.round(v * 0.37); d = v - f - l;
      bNote.textContent = "At " + money(v) + ", the planner can spread variety across the week.";
      setSplit("bFast", "bFastBar", "bFastTip", f, v, "Silog of choice with egg.");
      setSplit("bLunch", "bLunchBar", "bLunchTip", l, v, "Ulam of choice with rice and gulay.");
      setSplit("bDinner", "bDinnerBar", "bDinnerTip", d, v, "Soup or grilled ulam with rice.");
    }
    bVal.textContent = money(v);
    bVal2.textContent = money(v);
  }
  function setSplit(id, barId, tipId, amount, total, tip) {
    var el = document.getElementById(id);
    var bar = document.getElementById(barId);
    var tipEl = document.getElementById(tipId);
    if (el) el.textContent = money(amount);
    if (bar) bar.style.width = Math.round(amount / total * 100) + "%";
    if (tipEl) tipEl.textContent = tip;
  }
  if (range) {
    renderBudget(Number(range.value));
    range.addEventListener("input", function () { renderBudget(Number(range.value)); });
  }

  /* Solver demo: each lunch mix is evaluated in turn with a counted
     rate, then the cheapest per protein is locked. Plays on first view,
     replayable. Reduced motion and no-JS keep the final state. */
  var solData = [
    { name: "Tinola + half rice", cost: 30, protein: 12 },
    { name: "Ginisang gulay + half rice", cost: 28, protein: 11 },
    { name: "Pares + half rice", cost: 40, protein: 15 },
    { name: "Monggo + half rice", cost: 38, protein: 20 }
  ];
  solData.forEach(function (d) { d.rate = d.cost / d.protein * 10; });
  var solMax = Math.max.apply(null, solData.map(function (d) { return d.rate; }));
  var solWin = 0;
  solData.forEach(function (d, i) { if (d.rate < solData[solWin].rate) solWin = i; });

  var solBox = document.querySelector(".solver");
  var solRows = document.getElementById("solRows");
  var solProg = document.getElementById("solProg");
  var solStatus = document.getElementById("solStatus");
  var solReplay = document.getElementById("solReplay");
  var solTimers = [];
  var solPlaying = false;
  var solReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function solFmt(n) { return "P" + n.toFixed(2); }
  function solClear() { solTimers.forEach(clearTimeout); solTimers = []; }
  function solRowEls() {
    return solRows ? Array.prototype.slice.call(solRows.querySelectorAll(".sol-row")) : [];
  }
  function solReset(rows) {
    rows.forEach(function (r) {
      r.classList.remove("eval", "win");
      var fill = r.querySelector(".bar i");
      var rate = r.querySelector(".sol-rate");
      if (fill) fill.style.width = "0%";
      if (rate) rate.textContent = "";
    });
    if (solProg) solProg.style.width = "0%";
  }
  function solCount(el, target, dur) {
    var start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = solFmt(target * eased) + " per 10g protein";
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function runSolver() {
    var rows = solRowEls();
    if (!rows.length) return;
    solClear();
    solPlaying = true;
    solReset(rows);
    if (solStatus) solStatus.textContent = "Reading board prices...";
    solData.forEach(function (d, i) {
      solTimers.push(setTimeout(function () {
        var r = rows[i];
        r.classList.add("eval");
        var fill = r.querySelector(".bar i");
        var rate = r.querySelector(".sol-rate");
        if (fill) fill.style.width = Math.round(d.rate / solMax * 100) + "%";
        if (rate) solCount(rate, d.rate, 450);
        if (solProg) solProg.style.width = Math.round((i + 1) / solData.length * 100) + "%";
        if (solStatus) solStatus.textContent = "Checking mix " + (i + 1) + " of " + solData.length + ": " + d.name + ".";
      }, 500 + i * 700));
    });
    solTimers.push(setTimeout(function () {
      rows.forEach(function (r) { r.classList.remove("eval"); });
      rows[solWin].classList.add("win");
      if (solStatus) solStatus.textContent = solData[solWin].name + " wins at " + solFmt(solData[solWin].rate) + " per 10g protein. Lunch locked.";
      solPlaying = false;
    }, 500 + solData.length * 700 + 250));
  }
  if (solBox && solRows && !solReduced) {
    solBox.classList.add("sol-live");
    solReset(solRowEls());
    if ("IntersectionObserver" in window) {
      var solIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !solPlaying) { runSolver(); }
        });
      }, { threshold: 0.35 });
      solIO.observe(solBox);
    } else {
      runSolver();
    }
    if (solReplay) solReplay.addEventListener("click", runSolver);
  } else if (solReplay) {
    solReplay.addEventListener("click", function () {
      if (solStatus) solStatus.textContent = solData[solWin].name + " wins at " + solFmt(solData[solWin].rate) + " per 10g protein. Lunch locked.";
    });
  }

  /* Scroll reveals: only hide what we can observe back in.
     No-JS and no-IO browsers keep everything visible. */
  var revealTargets = document.querySelectorAll(
    ".fact, .step, .diary, .swap, .panel, .quotes, .two-col > div, .faq, .cta, .board"
  );
  if ("IntersectionObserver" in window && revealTargets.length) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* Pilot form: local confirmation only */
  var form = document.getElementById("pilotForm");
  var msg = document.getElementById("formMsg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("email");
      var email = input ? input.value.trim() : "";
      if (!email) {
        if (msg) msg.textContent = "Enter an email so we can send the sample.";
        return;
      }
      if (msg) msg.textContent = "Thanks. We will send a 7-day sample built around your budget to " + email + ".";
      form.reset();
    });
  }
})();
