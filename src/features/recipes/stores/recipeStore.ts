import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '../types/recipe';
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
  filterRecipes: (type: 'prepared' | 'final', searchTerm: string) => Recipe[];
  addRecipe: (recipe: Recipe) => Promise<void>;
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
        .select(`
          *,
          recipe_ingredients (
            *,
            master_ingredient:master_ingredients (
              id, item_code, product
            ),
            prepared_recipe:recipes (
              id, name
            )
          ),
          recipe_steps (*),
          recipe_equipment (*),
          recipe_media (*),
          recipe_versions (*),
          recipe_quality_standards (*),
          recipe_training (*)
        `)
        .eq('organization_id', user.user_metadata.organizationId)
        .order('name');

      if (error) throw error;

      // Transform data to match Recipe type
      const transformedRecipes = data.map(recipe => ({
        id: recipe.id,
        type: recipe.type,
        name: recipe.name,
        description: recipe.description,
        station: recipe.station,
        storageArea: recipe.storage_area,
        container: recipe.container,
        containerType: recipe.container_type,
        shelfLife: recipe.shelf_life,
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        recipeUnitRatio: recipe.recipe_unit_ratio,
        unitType: recipe.unit_type,
        yield: {
          amount: recipe.yield_amount,
          unit: recipe.yield_unit
        },
        ingredients: recipe.recipe_ingredients,
        steps: recipe.recipe_steps,
        media: recipe.recipe_media,
        allergenInfo: {
          contains: [],
          mayContain: [],
          crossContactRisk: []
        },
        qualityStandards: recipe.recipe_quality_standards?.[0] || {
          appearance: { description: '' },
          texture: [],
          taste: [],
          aroma: [],
          temperature: { value: 0, unit: 'F', tolerance: 0 }
        },
        training: recipe.recipe_training?.[0] || {
          requiredSkillLevel: 'beginner',
          certificationRequired: [],
          commonErrors: [],
          keyTechniques: [],
          safetyProtocols: []
        },
        equipment: recipe.recipe_equipment,
        laborCostPerHour: recipe.labor_cost_per_hour,
        ingredientCost: recipe.ingredient_cost,
        totalCost: recipe.total_cost,
        costPerUnit: recipe.cost_per_unit,
        costPerRatioUnit: recipe.cost_per_ratio_unit,
        costPerServing: recipe.cost_per_serving,
        targetCostPercent: recipe.target_cost_percent,
        version: recipe.version,
        versions: recipe.recipe_versions,
        lastModified: recipe.updated_at,
        modifiedBy: recipe.modified_by
      }));

      set({ recipes: transformedRecipes });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
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

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          organization_id: user.user_metadata.organizationId,
          ...recipe,
          created_by: user.id,
          modified_by: user.id
        }])
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
          modified_by: user.id,
          updated_at: new Date().toISOString()
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

  filterRecipes: (type, searchTerm) => {
    const { recipes } = get();
    return recipes.filter(recipe => {
      const matchesType = recipe.type === type;
      const matchesSearch = searchTerm ? (
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.station?.toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;
      return matchesType && matchesSearch;
    });
  },

  addRecipe: async (recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          ...recipe,
          organization_id: user.user_metadata.organizationId,
          created_by: user.id,
          modified_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        recipes: [...state.recipes, data]
      }));

      toast.success('Recipe imported successfully');
    } catch (error) {
      console.error('Error importing recipe:', error);
      toast.error('Failed to import recipe');
      throw error;
    }
  }
}));