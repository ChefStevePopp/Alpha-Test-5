import React from 'react';
import { Package, CircleDollarSign, Plus, Trash2 } from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';

interface RecipeInformationProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const RecipeInformation: React.FC<RecipeInformationProps> = ({
  recipe,
  onChange
}) => {
  const { groups, categories, subCategories } = useFoodRelationshipsStore();
  const { ingredients: masterIngredients } = useMasterIngredientsStore();

  const calculateCosts = () => {
    // Calculate ingredient costs
    const ingredientCost = recipe.ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.quantity * ingredient.cost);
    }, 0);

    // Calculate labor cost
    const totalTime = recipe.prepTime + recipe.cookTime;
    const laborCost = (totalTime / 60) * recipe.laborCostPerHour;

    // Calculate total and per unit costs
    const totalCost = ingredientCost + laborCost;
    const costPerUnit = totalCost / recipe.yield.amount;

    return {
      ingredientCost,
      laborCost,
      totalCost,
      costPerUnit
    };
  };

  const handleAddIngredient = () => {
    const newIngredient = {
      id: `ing-${Date.now()}`,
      type: 'raw' as const,
      name: '',
      quantity: '',
      unit: 'g',
      notes: '',
      cost: 0
    };

    onChange({
      ingredients: [...recipe.ingredients, newIngredient]
    });
  };

  const handleUpdateIngredient = (index: number, updates: Partial<typeof recipe.ingredients[0]>) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], ...updates };
    onChange({ ingredients: newIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    onChange({
      ingredients: recipe.ingredients.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Recipe Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipe Name
            </label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="input w-full"
              placeholder="Enter recipe name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipe Type
            </label>
            <select
              value={recipe.type}
              onChange={(e) => onChange({ type: e.target.value as 'prepared' | 'final' })}
              className="input w-full"
              required
            >
              <option value="prepared">Prepared Item</option>
              <option value="final">Final Plate</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Description
          </label>
          <textarea
            value={recipe.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="input w-full h-24"
            placeholder="Enter recipe description"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Major Group
            </label>
            <select
              value={recipe.majorGroup || ''}
              onChange={(e) => onChange({ 
                majorGroup: e.target.value,
                category: '', // Reset lower levels when parent changes
                subCategory: ''
              })}
              className="input w-full"
              required
            >
              <option value="">Select major group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Category
            </label>
            <select
              value={recipe.category || ''}
              onChange={(e) => onChange({ 
                category: e.target.value,
                subCategory: '' // Reset sub-category when category changes
              })}
              className="input w-full"
              required
              disabled={!recipe.majorGroup}
            >
              <option value="">Select category...</option>
              {categories
                .filter(cat => cat.groupId === recipe.majorGroup)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Sub-Category
            </label>
            <select
              value={recipe.subCategory || ''}
              onChange={(e) => onChange({ subCategory: e.target.value })}
              className="input w-full"
              disabled={!recipe.category}
            >
              <option value="">Select sub-category...</option>
              {subCategories
                .filter(sub => sub.categoryId === recipe.category)
                .map(subCategory => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipe Unit Ratio
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipe.recipeUnitRatio}
                onChange={(e) => onChange({ recipeUnitRatio: e.target.value })}
                className="input flex-1"
                placeholder="e.g., 4 servings"
                required
              />
              <select
                value={recipe.unitType}
                onChange={(e) => onChange({ unitType: e.target.value })}
                className="input w-32"
                required
              >
                <option value="servings">servings</option>
                <option value="portions">portions</option>
                <option value="pieces">pieces</option>
                <option value="g">grams</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">liters</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Station
            </label>
            <select
              value={recipe.station}
              onChange={(e) => onChange({ station: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select station...</option>
              <option value="grill">Grill</option>
              <option value="saute">Sauté</option>
              <option value="fry">Fry</option>
              <option value="prep">Prep</option>
              <option value="pantry">Pantry</option>
              <option value="pizza">Pizza</option>
              <option value="expo">Expo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Ingredients & Costing</h3>
          </div>
          <button
            onClick={handleAddIngredient}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </button>
        </div>

        <div className="space-y-4">
          {recipe.ingredients.map((ingredient, index) => (
            <div
              key={ingredient.id}
              className="grid grid-cols-6 gap-4 bg-gray-800/50 p-4 rounded-lg"
            >
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Ingredient
                </label>
                <select
                  value={ingredient.name}
                  onChange={(e) => {
                    const selectedIngredient = masterIngredients.find(
                      i => i.id === e.target.value
                    );
                    if (selectedIngredient) {
                      handleUpdateIngredient(index, {
                        name: e.target.value,
                        cost: selectedIngredient.costPerRecipeUnit
                      });
                    }
                  }}
                  className="input w-full"
                  required
                >
                  <option value="">Select ingredient</option>
                  {masterIngredients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => handleUpdateIngredient(index, { quantity: e.target.value })}
                  className="input w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Unit
                </label>
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleUpdateIngredient(index, { unit: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="l">Liters (l)</option>
                  <option value="unit">Units</option>
                  <option value="tbsp">Tablespoon</option>
                  <option value="tsp">Teaspoon</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={ingredient.notes || ''}
                  onChange={(e) => handleUpdateIngredient(index, { notes: e.target.value })}
                  className="input w-full"
                  placeholder="Optional notes"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Summary */}
        <div className="bg-emerald-500/10 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Labor Rate (per hour)
              </label>
              <input
                type="number"
                value={recipe.laborCostPerHour}
                onChange={(e) => onChange({ laborCostPerHour: parseFloat(e.target.value) })}
                className="input w-full"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Target Food Cost %
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={recipe.targetCostPercent}
                  onChange={(e) => onChange({ targetCostPercent: parseInt(e.target.value) })}
                  className="input flex-1"
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="input w-12 bg-gray-700 flex items-center justify-center">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Cost Summary
              </label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ingredient Cost:</span>
                  <span className="text-white">${recipe.ingredientCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Labor Cost:</span>
                  <span className="text-white">
                    ${((recipe.prepTime + recipe.cookTime) / 60 * recipe.laborCostPerHour).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-emerald-400">Total Cost:</span>
                  <span className="text-emerald-400">${recipe.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Unit Costs
              </label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost per {recipe.unitType}:</span>
                  <span className="text-white">${recipe.costPerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Cost:</span>
                  <span className="text-white">
                    ${(recipe.totalCost * (recipe.targetCostPercent / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};