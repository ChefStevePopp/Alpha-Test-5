import React, { useState } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { useRecipeStore } from '../../stores/recipeStore';
import { RecipeInformation } from './RecipeInformation';
import { ProductionSpecs } from './ProductionSpecs';
import { InstructionEditor } from './InstructionEditor';
import { StationEquipment } from './StationEquipment';
import { StorageProtocols } from './StorageProtocols';
import { QualityStandards } from './QualityStandards';
import { AllergenControl } from './AllergenControl';
import { MediaManager } from './MediaManager';
import { TrainingModule } from './TrainingModule';
import { VersionHistory } from './VersionHistory';
import type { Recipe } from '../../types/recipe';
import toast from 'react-hot-toast';

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({ isOpen, onClose, recipe: initialRecipe }) => {
  const [activeTab, setActiveTab] = useState('recipe');
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { updateRecipe } = useRecipeStore();

  const handleChange = (updates: Partial<Recipe>) => {
    setRecipe(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!recipe) return;

    try {
      await updateRecipe(recipe.id, {
        ...recipe,
        lastModified: new Date().toISOString()
      });
      setHasUnsavedChanges(false);
      toast.success('Recipe saved successfully');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
  };

  const tabs = [
    { id: 'recipe', label: 'Recipe Information' },
    { id: 'production', label: 'Production' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'stations', label: 'Stations & Equipment' },
    { id: 'storage', label: 'Storage' },
    { id: 'quality', label: 'Quality Standards' },
    { id: 'allergens', label: 'Allergens' },
    { id: 'media', label: 'Media' },
    { id: 'training', label: 'Training' },
    { id: 'versions', label: 'Versions' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <header className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Edit Recipe</h2>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-6 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'recipe' && (
            <RecipeInformation
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'production' && (
            <ProductionSpecs
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'instructions' && (
            <InstructionEditor
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'stations' && (
            <StationEquipment
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'storage' && (
            <StorageProtocols
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'quality' && (
            <QualityStandards
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'allergens' && (
            <AllergenControl
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'media' && (
            <MediaManager
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'training' && (
            <TrainingModule
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'versions' && (
            <VersionHistory
              recipe={recipe}
              onChange={handleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};