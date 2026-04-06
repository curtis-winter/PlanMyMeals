export const GROCERY_SECTIONS: Record<string, string[]> = {
  'Produce': ['apple', 'banana', 'orange', 'lettuce', 'spinach', 'carrot', 'onion', 'garlic', 'potato', 'tomato', 'cucumber', 'pepper', 'broccoli', 'cabbage', 'herb', 'cilantro', 'parsley', 'basil', 'ginger', 'lemon', 'lime', 'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'avocado', 'mushroom'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'steak', 'ground', 'turkey', 'fish', 'salmon', 'shrimp', 'tuna', 'bacon', 'sausage', 'ham', 'lamb'],
  'Dairy & Eggs': ['milk', 'egg', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream', 'cottage cheese', 'parmesan', 'cheddar', 'mozzarella'],
  'Bakery': ['bread', 'bun', 'tortilla', 'bagel', 'muffin', 'pastry', 'pita'],
  'Pantry & Grains': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'honey', 'syrup', 'cereal', 'oat', 'bean', 'lentil', 'nut', 'seed', 'cracker', 'chip', 'snack', 'quinoa', 'couscous'],
  'Canned & Jarred': ['canned', 'soup', 'sauce', 'salsa', 'pickle', 'olive', 'peanut butter', 'jam', 'jelly', 'broth', 'stock'],
  'Frozen': ['frozen', 'ice cream', 'pizza'],
  'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
  'Spices & Baking': ['salt', 'pepper', 'spice', 'cinnamon', 'vanilla', 'baking powder', 'baking soda', 'yeast', 'cocoa'],
  'Other': []
};

export const getSection = (itemName: string): string => {
  const lowerName = itemName.toLowerCase();
  for (const [section, keywords] of Object.entries(GROCERY_SECTIONS)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return section;
    }
  }
  return 'Other';
};
