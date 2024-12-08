import React from 'react';
import { Package } from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';

interface BasicInformationProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  recipe,
  onChange
}) => {
  const { groups, categories, subCategories } = useFoodRelationshipsStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white">Basic Information</h3>
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
  );
};