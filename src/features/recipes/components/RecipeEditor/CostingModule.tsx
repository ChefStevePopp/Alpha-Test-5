import React from 'react';
import { CircleDollarSign, Calculator, AlertTriangle } from 'lucide-react';
import { useRecipeStore } from '../../stores/recipeStore';
import { LABOR_RATE_PER_HOUR } from '@/constants';
import type { Recipe } from '../../types/recipe';

interface CostingModuleProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const CostingModule: React.FC<CostingModuleProps> = ({ recipe, onChange }) => {
  const { calculateCosts } = useRecipeStore();

  // Calculate costs whenever relevant values change
  React.useEffect(() => {
    const costs = calculateCosts(recipe);
    onChange({
      ingredientCost: costs.ingredientCost,
      totalCost: costs.totalCost,
      costPerUnit: costs.costPerUnit
    });
  }, [recipe.ingredients, recipe.prepTime, recipe.cookTime, recipe.yield.amount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const targetCost = recipe.totalCost * (recipe.targetCostPercent / 100);
  const isOverTarget = recipe.totalCost > targetCost;

  return (
    <div className="space-y-6">
      {/* Ingredient Costs */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-primary-400" />
          Ingredient Costs
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {recipe.ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-medium">{ingredient.id}</p>
                    <p className="text-sm text-gray-400">
                      {ingredient.amount} {ingredient.unit}
                    </p>
                  </div>
                  <p className="text-primary-400 font-medium">
                    {formatCurrency(ingredient.costPerUnit * ingredient.amount)}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(ingredient.costPerUnit)} per {ingredient.unit}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <span className="text-gray-400">Total Ingredient Cost</span>
            <span className="text-xl font-medium text-white">
              {formatCurrency(recipe.ingredientCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Labor Costs */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-400" />
          Labor Costs
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Labor Rate per Hour
              </label>
              <input
                type="number"
                value={recipe.laborCostPerHour || LABOR_RATE_PER_HOUR}
                onChange={(e) => onChange({ laborCostPerHour: parseFloat(e.target.value) })}
                className="input w-full"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Total Time (minutes)
              </label>
              <input
                type="number"
                value={recipe.prepTime + recipe.cookTime}
                className="input w-full bg-gray-700"
                disabled
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <span className="text-gray-400">Total Labor Cost</span>
            <span className="text-xl font-medium text-white">
              {formatCurrency(((recipe.prepTime + recipe.cookTime) / 60) * (recipe.laborCostPerHour || LABOR_RATE_PER_HOUR))}
            </span>
          </div>
        </div>
      </div>

      {/* Recipe Yield & Unit Costs */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Recipe Yield & Unit Costs</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipe Yield
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={recipe.yield.amount}
                onChange={(e) => onChange({
                  yield: { ...recipe.yield, amount: parseFloat(e.target.value) }
                })}
                className="input flex-1"
                min="1"
                step="1"
              />
              <select
                value={recipe.yield.unit}
                onChange={(e) => onChange({
                  yield: { ...recipe.yield, unit: e.target.value }
                })}
                className="input w-32"
              >
                <option value="portion">Portions</option>
                <option value="serving">Servings</option>
                <option value="kg">Kilograms</option>
                <option value="lb">Pounds</option>
                <option value="each">Each</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Target Cost %
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={recipe.targetCostPercent}
                onChange={(e) => onChange({ targetCostPercent: parseFloat(e.target.value) })}
                className="input flex-1"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="input w-12 flex items-center justify-center bg-gray-700">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Cost Summary</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Cost</span>
              <span className="text-xl font-medium text-white">
                {formatCurrency(recipe.totalCost)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cost per {recipe.yield.unit}</span>
              <span className="text-xl font-medium text-white">
                {formatCurrency(recipe.costPerUnit)}
              </span>
            </div>
          </div>
          <div>
            {isOverTarget && (
              <div className="bg-rose-500/10 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-rose-400 font-medium">Cost Warning</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Current cost is above target. Target cost should be {formatCurrency(targetCost)}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};