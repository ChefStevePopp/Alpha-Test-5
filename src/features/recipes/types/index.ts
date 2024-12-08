export interface Recipe {
  id: string;
  type: 'prepared' | 'final';
  name: string;
  category: string;
  subCategory: string;
  station: string;
  storageArea: string;
  container: string;
  containerType: string;
  shelfLife: string;
  description: string;
  prepTime: number;
  cookTime: number;
  recipeUnitRatio: string;
  unitType: string;
  costPerRatioUnit: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  notes: string;
  costPerServing: number;
  lastUpdated: string;
  imageUrl?: string;
  allergens: string[];
}

export interface RecipeIngredient {
  id: string;
  type: 'raw' | 'prepared';
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  cost: number;
  preparedItemId?: string;
}

export interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  currentRecipe: Recipe | null;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'lastUpdated'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  calculateCosts: (recipe: Recipe) => { totalCost: number; costPerServing: number };
  filterRecipes: (type: 'prepared' | 'final', searchTerm: string) => Recipe[];
  seedFromPreparedItems: (preparedItems: any[]) => void;
}