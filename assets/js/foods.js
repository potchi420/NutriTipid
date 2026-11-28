/* shared dish catalogue, the single source for the planner, the admin
   board, the dashboard add sheet and the assistant. pages keep only their
   own visuals (dots, photos) and map them by name. records stay keyed by
   these names, admin edits layer on top via board.js. allergen tags use the
   seven groups from profile.js and follow typical recipes
   */
window.NutriTipidAllergenNote = "Allergen tags follow typical recipes. Confirm with the vendor.";
window.NutriTipidFoods = [
  { name: "Lugaw", price: 15, kcal: 280, protein: 7, cat: "Rice meal", al: ["Fish"] },
  { name: "Arroz caldo w/ egg", price: 30, kcal: 420, protein: 14, cat: "Rice meal", al: ["Egg", "Fish"] },
  { name: "Fried egg and rice", price: 20, kcal: 350, protein: 12, cat: "Rice meal", al: ["Egg"] },
  { name: "Chicken Tinola", price: 45, kcal: 460, protein: 24, cat: "Ulam", al: ["Fish"] },
  { name: "Chicken Adobo", price: 40, kcal: 520, protein: 30, cat: "Ulam", al: ["Soy", "Wheat"] },
  { name: "Pork Menudo", price: 45, kcal: 540, protein: 22, cat: "Ulam", al: ["Soy", "Wheat"] },
  { name: "Pork Sinigang", price: 50, kcal: 480, protein: 20, cat: "Ulam", al: ["Fish"] },
  { name: "Ginisang Monggo", price: 35, kcal: 520, protein: 20, cat: "Ulam", al: ["Shellfish", "Fish"] },
  { name: "Adobong Kangkong", price: 25, kcal: 320, protein: 9, cat: "Ulam", al: ["Soy", "Wheat"] },
  { name: "Beef Caldereta", price: 55, kcal: 600, protein: 24, cat: "Ulam", al: ["Milk"] },
  { name: "Chop Suey", price: 35, kcal: 380, protein: 10, cat: "Ulam", al: ["Shellfish", "Egg", "Soy", "Wheat"] },
  { name: "Sinigang na Hipon", price: 45, kcal: 380, protein: 22, cat: "Ulam", al: ["Shellfish", "Fish"] },
  { name: "Sinigang na Bangus", price: 45, kcal: 420, protein: 24, cat: "Ulam", al: ["Fish"] }
];
