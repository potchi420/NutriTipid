/* shared dish catalogue for pages that only need to read it (the assistant).
   copied as is from the BASE list in pages/admin.html, which carries the
   same 13 dishes and values as DISHES in pages/planner.html plus the
   category. keep the three in step by hand until the pages load this file.
   records stay keyed by these names, admin edits layer on top via board.js
   */
window.NutriTipidFoods = [
  { name: "Lugaw", price: 15, kcal: 280, protein: 7, cat: "Rice meal", al: [] },
  { name: "Arroz caldo w/ egg", price: 30, kcal: 420, protein: 14, cat: "Rice meal", al: ["Egg"] },
  { name: "Fried egg and rice", price: 20, kcal: 350, protein: 12, cat: "Rice meal", al: ["Egg"] },
  { name: "Chicken Tinola", price: 45, kcal: 460, protein: 24, cat: "Ulam", al: [] },
  { name: "Chicken Adobo", price: 40, kcal: 520, protein: 30, cat: "Ulam", al: [] },
  { name: "Pork Menudo", price: 45, kcal: 540, protein: 22, cat: "Ulam", al: [] },
  { name: "Pork Sinigang", price: 50, kcal: 480, protein: 20, cat: "Ulam", al: [] },
  { name: "Ginisang Monggo", price: 35, kcal: 520, protein: 20, cat: "Ulam", al: ["Shrimp"] },
  { name: "Adobong Kangkong", price: 25, kcal: 320, protein: 9, cat: "Ulam", al: [] },
  { name: "Beef Caldereta", price: 55, kcal: 600, protein: 24, cat: "Ulam", al: [] },
  { name: "Chop Suey", price: 35, kcal: 380, protein: 10, cat: "Ulam", al: [] },
  { name: "Sinigang na Hipon", price: 45, kcal: 380, protein: 22, cat: "Ulam", al: ["Shrimp"] },
  { name: "Sinigang na Bangus", price: 45, kcal: 420, protein: 24, cat: "Ulam", al: ["Fish"] }
];
