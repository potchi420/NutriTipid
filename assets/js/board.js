/* the price board, admin writes, planner reads at generation.
   price overrides, soft-deletes, price history, deactivated accounts,
   mirrors FoodItem.IsActive / PriceHistory / AppUsers.IsActive from the schema
   */
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

  /* dish detail edits (name, category, allergens, nutrition), keyed by the
     ORIGINAL dish name so price overrides and activation flags never
     detach. a rename only changes what's displayed, the keys stay put
   */
  function dishMetas() {
    var m = readJson("nutritipid-dishmeta", null);
    return m && typeof m === "object" && m.edits ? m.edits : {};
  }
  function saveMetas(edits) {
    try { localStorage.setItem("nutritipid-dishmeta", JSON.stringify({ edits: edits })); } catch (e) {}
  }
  function metaOf(name) {
    var e = dishMetas()[name];
    return e && typeof e === "object" ? e : null;
  }
  function setDishMeta(name, patch) {
    var edits = dishMetas();
    var cur = edits[name] || {};
    Object.keys(patch).forEach(function (k) {
      if (typeof patch[k] !== "undefined") cur[k] = patch[k];
    });
    edits[name] = cur;
    saveMetas(edits);
    return cur;
  }

/* admin-added dishes own their whole record, so an edit rewrites it and a
     rename carries every name-keyed record along with it
   */
  function updateExtra(name, patch) {
    var d = readJson("nutritipid-dishes", null);
    if (!d || !Array.isArray(d.extras)) return false;
    var hit = null;
    d.extras.forEach(function (x) { if (x.name === name) hit = x; });
    if (!hit) return false;
    var newName = typeof patch.name === "string" && patch.name && patch.name !== name ? patch.name : null;
    if (newName) {
      var b = board();
      if (Object.prototype.hasOwnProperty.call(b.prices, name)) {
        b.prices[newName] = b.prices[name];
        delete b.prices[name];
        saveBoard(b);
      }
      var i = b.inactive.indexOf(name);
      if (i >= 0) {
        b.inactive.splice(i, 1);
        b.inactive.push(newName);
        saveBoard(b);
      }
      var edits = dishMetas();
      if (edits[name]) {
        edits[newName] = edits[name];
        delete edits[name];
        saveMetas(edits);
      }
      hit.name = newName;
    }
    ["cat", "al", "kcal", "protein", "source"].forEach(function (k) {
      if (typeof patch[k] !== "undefined") hit[k] = patch[k];
    });
    try { localStorage.setItem("nutritipid-dishes", JSON.stringify(d)); } catch (e) {}
    return true;
  }

  /* allergen lookup, ships with the base three, admin owns it after that
   */
  var BASE_ALLERGENS = ["Shrimp", "Egg", "Fish"];
  function allStore() {
    var a = readJson("nutritipid-allergens", null);
    if (!a || !Array.isArray(a.list)) a = { list: BASE_ALLERGENS.slice() };
    return a;
  }
  function allergens() {
    return allStore().list.slice();
  }
  function addAllergen(name) {
    var n = String(name || "").trim();
    if (!n) return false;
    var a = allStore();
    if (a.list.indexOf(n) >= 0) return false;
    a.list.push(n);
    try { localStorage.setItem("nutritipid-allergens", JSON.stringify(a)); } catch (e) {}
    return true;
  }
  function removeAllergen(name) {
    var a = allStore();
    var i = a.list.indexOf(name);
    if (i < 0) return false;
    a.list.splice(i, 1);
    try { localStorage.setItem("nutritipid-allergens", JSON.stringify(a)); } catch (e) {}
    return true;
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
    addExtra: addExtra,
    metaOf: metaOf,
    setDishMeta: setDishMeta,
    updateExtra: updateExtra,
    allergens: allergens,
    addAllergen: addAllergen,
    removeAllergen: removeAllergen
  };
})();
