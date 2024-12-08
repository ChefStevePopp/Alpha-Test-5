import React from 'react';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { AllergenSelector } from '@/features/allergens/components/AllergenSelector';
import { AllergenBadge } from '@/features/allergens/components/AllergenBadge';
import type { Recipe } from '../../types/recipe';
import type { AllergenType } from '@/features/allergens/types';

interface AllergenControlProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const AllergenControl: React.FC<AllergenControlProps> = ({
  recipe,
  onChange
}) => {
  const handleAllergenChange = (allergenKey: string, isContained: boolean) => {
    const allergen = allergenKey as AllergenType;
    const contains = new Set(recipe.allergenInfo.contains);
    const mayContain = new Set(recipe.allergenInfo.mayContain);
    const crossContactRisk = new Set(recipe.allergenInfo.crossContactRisk);

    if (isContained) {
      contains.add(allergen);
      mayContain.delete(allergen);
      crossContactRisk.delete(allergen);
    } else {
      contains.delete(allergen);
    }

    onChange({
      allergenInfo: {
        contains: Array.from(contains),
        mayContain: Array.from(mayContain),
        crossContactRisk: Array.from(crossContactRisk)
      }
    });
  };

  const handleCrossContactChange = (allergenKey: string, isAtRisk: boolean) => {
    const allergen = allergenKey as AllergenType;
    const contains = new Set(recipe.allergenInfo.contains);
    const mayContain = new Set(recipe.allergenInfo.mayContain);
    const crossContactRisk = new Set(recipe.allergenInfo.crossContactRisk);

    if (isAtRisk) {
      crossContactRisk.add(allergen);
      if (!contains.has(allergen)) {
        mayContain.add(allergen);
      }
    } else {
      crossContactRisk.delete(allergen);
      mayContain.delete(allergen);
    }

    onChange({
      allergenInfo: {
        contains: Array.from(contains),
        mayContain: Array.from(mayContain),
        crossContactRisk: Array.from(crossContactRisk)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Allergen Warning Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">Allergen Control</h3>
          <p className="text-sm text-gray-400">
            Manage allergen information and cross-contamination risks
          </p>
        </div>
      </div>

      {/* Ingredient Allergens */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-400" />
          Contains
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recipe.allergenInfo.contains.map((allergen) => (
            <div key={allergen} className="flex items-center gap-2">
              <AllergenBadge type={allergen} showLabel />
            </div>
          ))}
        </div>
      </div>

      {/* Cross Contact Risks */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Cross-Contact Risks
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recipe.allergenInfo.crossContactRisk.map((allergen) => (
            <div key={allergen} className="flex items-center gap-2">
              <AllergenBadge type={allergen} showLabel />
            </div>
          ))}
        </div>
      </div>

      {/* Allergen Selector */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">Update Allergens</h4>
        <AllergenSelector
          ingredient={{
            allergenPeanut: recipe.allergenInfo.contains.includes('peanut'),
            allergenCrustacean: recipe.allergenInfo.contains.includes('crustacean'),
            allergenTreenut: recipe.allergenInfo.contains.includes('treenut'),
            allergenShellfish: recipe.allergenInfo.contains.includes('shellfish'),
            allergenSesame: recipe.allergenInfo.contains.includes('sesame'),
            allergenSoy: recipe.allergenInfo.contains.includes('soy'),
            allergenFish: recipe.allergenInfo.contains.includes('fish'),
            allergenWheat: recipe.allergenInfo.contains.includes('wheat'),
            allergenMilk: recipe.allergenInfo.contains.includes('milk'),
            allergenSulphite: recipe.allergenInfo.contains.includes('sulphite'),
            allergenEgg: recipe.allergenInfo.contains.includes('egg'),
            allergenGluten: recipe.allergenInfo.contains.includes('gluten'),
            allergenMustard: recipe.allergenInfo.contains.includes('mustard'),
            allergenCelery: recipe.allergenInfo.contains.includes('celery'),
            allergenGarlic: recipe.allergenInfo.contains.includes('garlic'),
            allergenOnion: recipe.allergenInfo.contains.includes('onion'),
            allergenNitrite: recipe.allergenInfo.contains.includes('nitrite'),
            allergenMushroom: recipe.allergenInfo.contains.includes('mushroom'),
            allergenHotPepper: recipe.allergenInfo.contains.includes('hot_pepper'),
            allergenCitrus: recipe.allergenInfo.contains.includes('citrus'),
            allergenPork: recipe.allergenInfo.contains.includes('pork')
          }}
          onChange={(updates) => {
            // Convert allergen updates to recipe allergen format
            Object.entries(updates).forEach(([key, value]) => {
              const allergen = key.replace('allergen', '').toLowerCase() as AllergenType;
              handleAllergenChange(allergen, value as boolean);
            });
          }}
        />
      </div>

      {/* Cross-Contact Management */}
      <div className="bg-yellow-500/10 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Cross-Contact Prevention</p>
            <p className="text-sm text-gray-300 mt-1">
              Identify potential cross-contact risks during preparation and storage.
              Consider shared equipment, storage areas, and preparation surfaces.
            </p>
            <div className="mt-4 space-y-2">
              {recipe.allergenInfo.crossContactRisk.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recipe.allergenInfo.crossContactRisk.map((allergen) => (
                    <div key={allergen} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                      <AllergenBadge type={allergen} />
                      <span className="text-sm text-gray-300">{allergen}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No cross-contact risks identified</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Allergen Warnings */}
      {(recipe.allergenInfo.contains.length > 0 || recipe.allergenInfo.crossContactRisk.length > 0) && (
        <div className="bg-rose-500/10 rounded-lg p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-rose-400 font-medium">Required Allergen Warnings</p>
              <div className="mt-2 space-y-2">
                {recipe.allergenInfo.contains.length > 0 && (
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Contains:</span>{' '}
                    {recipe.allergenInfo.contains.join(', ')}
                  </p>
                )}
                {recipe.allergenInfo.mayContain.length > 0 && (
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">May Contain:</span>{' '}
                    {recipe.allergenInfo.mayContain.join(', ')}
                  </p>
                )}
                {recipe.allergenInfo.crossContactRisk.length > 0 && (
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Cross-Contact Risk:</span>{' '}
                    {recipe.allergenInfo.crossContactRisk.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};