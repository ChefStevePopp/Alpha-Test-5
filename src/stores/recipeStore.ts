import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/features/recipes/types/recipe';
import toast from 'react-hot-toast';

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  currentRecipe: Recipe | null;
  fetchRecipes: () => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'lastModified'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  calculateCosts: (recipe: Recipe) => { totalCost: number; costPerServing: number };
  filterRecipes: (type: 'prepared' | 'final', searchTerm: string) => Recipe[];
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  currentRecipe: null,

  fetchRecipes: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('name');

      if (error) throw error;

      // If no recipes exist yet, seed with sample data
      if (data.length === 0) {
        const { error: seedError } = await supabase
          .from('recipes')
          .insert(sampleRecipes.map(recipe => ({
            ...recipe,
            organization_id: user.user_metadata.organizationId
          })));

        if (seedError) throw seedError;

        set({ recipes: sampleRecipes });
      } else {
        set({ recipes: data });
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
      // Fall back to sample data if fetch fails
      set({ recipes: sampleRecipes });
    } finally {
      set({ isLoading: false });
    }
  },

  createRecipe: async (recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const newRecipe = {
        ...recipe,
        organization_id: user.user_metadata.organizationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id,
        modified_by: user.id
      };

      const { data, error } = await supabase
        .from('recipes')
        .insert([newRecipe])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        recipes: [...state.recipes, data]
      }));

      toast.success('Recipe created successfully');
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error('Failed to create recipe');
      throw error;
    }
  },

  updateRecipe: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('recipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          modified_by: user.id
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        recipes: state.recipes.map(recipe =>
          recipe.id === id ? { ...recipe, ...updates } : recipe
        )
      }));

      toast.success('Recipe updated successfully');
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
      throw error;
    }
  },

  deleteRecipe: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id)
      }));

      toast.success('Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
      throw error;
    }
  },

  setCurrentRecipe: (recipe) => {
    set({ currentRecipe: recipe });
  },

  calculateCosts: (recipe) => {
    const ingredientCost = recipe.ingredients.reduce((sum, ingredient) => 
      sum + ingredient.cost, 0);
    
    const laborCost = ((recipe.prepTime + recipe.cookTime) / 60) * recipe.laborCostPerHour;
    const totalCost = ingredientCost + laborCost;
    const costPerServing = totalCost / parseInt(recipe.recipeUnitRatio);

    return { totalCost, costPerServing };
  },

  filterRecipes: (type, searchTerm) => {
    const { recipes } = get();
    return recipes.filter(recipe => {
      const matchesType = recipe.type === type;
      const matchesSearch = 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.subCategory?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }
}));

// Sample recipe data for development/fallback
const sampleRecipes: Recipe[] = [
  // ... sample recipe data remains the same ...
];