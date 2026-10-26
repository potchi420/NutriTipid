/* Reference board helpers, no framework: price overrides, soft-deletes,
   price history, deactivated accounts. Shaped after FoodItem.IsActive +
   PriceHistory (FoodId, OldPrice, NewPrice, UpdatedBy, UpdatedAt) +
   AppUsers.IsActive. Admin writes; the planner reads at generation. */
(function () {
  "use strict";

  function readJson(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "null");
      if (v && typeof v !== "undefined") return v;
    } catch (e) {}
    return fallback;
  }

  function board() {
    var b = readJson("nutritipid-priceboard", null);
    if (!b || typeof b !== "object" || !b.prices) b = { prices: {}, inactive: [] };
    if (!Array.isArray(b.inactive)) b.inactive = [];
    return b;
  }
  function saveBoard(b) {
    try { localStorage.setItem("nutritipid-priceboard", JSON.stringify(b)); } catch (e) {}
  }

  function stampTime() {
    var d = new Date();
    var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var h12 = d.getHours() % 12 || 12;
    return M[d.getMonth()] + " " + d.getDate() + ", " + h12 + ":" + ("0" + d.getMinutes()).slice(-2) + (d.getHours() < 12 ? " AM" : " PM");
  }

  function priceOf(name, basePrice) {
    var b = board();
    var v = b.prices[name];
    return typeof v === "number" ? v : basePrice;
  }
  function isActive(name) {
    return board().inactive.indexOf(name) < 0;
  }
  function setPrice(name, newPrice, by, base) {
    if (!(newPrice >= 0)) return false;
    if (Math.round(newPrice) !== newPrice || newPrice % 5 !== 0) return false;
    var b = board();
    var old = typeof b.prices[name] === "number" ? b.prices[name] : (typeof base === "number" ? base : null);
    if (newPrice === old) return false;
    b.prices[name] = newPrice;
    saveBoard(b);
    var h = readJson("nutritipid-pricehistory", null);
    if (!h || !Array.isArray(h.entries)) {
      h = { entries: [
        { food: "Beef Caldereta", old: 50, new: 55, by: "admin@example.com", at: "Sep 22, 10:05 AM" },
        { food: "Chicken Tinola", old: 40, new: 45, by: "admin@example.com", at: "Sep 8, 3:40 PM" }
      ] };
    }
    h.entries.push({ food: name, old: typeof old === "number" ? old : null, new: newPrice, by: by, at: stampTime() });
    try { localStorage.setItem("nutritipid-pricehistory", JSON.stringify(h)); } catch (e) {}
    return true;
  }
  function toggleActive(name) {
    var b = board();
    var i = b.inactive.indexOf(name);
    if (i >= 0) b.inactive.splice(i, 1); else b.inactive.push(name);
    saveBoard(b);
    return b.inactive.indexOf(name) < 0;
  }
  function history() {
    var h = readJson("nutritipid-pricehistory", null);
    return h && Array.isArray(h.entries) ? h.entries.slice().reverse() : [];
  }
  function deactivated() {
    var d = readJson("nutritipid-deactivated", null);
    return Array.isArray(d) ? d : [];
  }
  function toggleDeactivated(email) {
    var d = deactivated();
    var i = d.indexOf(email);
    if (i >= 0) d.splice(i, 1); else d.push(email);
    try { localStorage.setItem("nutritipid-deactivated", JSON.stringify(d)); } catch (e) {}
    return d.indexOf(email) < 0;
  }
  function extraDishes() {
    var d = readJson("nutritipid-dishes", null);
    return d && Array.isArray(d.extras) ? d.extras : [];
  }
  function addExtra(dish) {
    var d = readJson("nutritipid-dishes", null);
    if (!d || typeof d !== "object") d = { extras: [] };
    if (!Array.isArray(d.extras)) d.extras = [];
    d.extras.push(dish);
    try { localStorage.setItem("nutritipid-dishes", JSON.stringify(d)); } catch (e) {}
  }

  window.NutriTipidBoard = {
    priceOf: priceOf,
    isActive: isActive,
    setPrice: setPrice,
    toggleActive: toggleActive,
    history: history,
    deactivated: deactivated,
    toggleDeactivated: toggleDeactivated,
    extraDishes: extraDishes,
    addExtra: addExtra
  };
})();
