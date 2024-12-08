import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Camera, 
  Thermometer, 
  AlertTriangle,
  Plus,
  Trash2,
  Upload,
  Eye,
  Scale,
  Utensils,
  Clock,
  X
} from 'lucide-react';
import type { Recipe, RecipeQualityStandards } from '../../types/recipe';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface QualityStandardsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const QualityStandards: React.FC<QualityStandardsProps> = ({ recipe, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const updateQualityStandards = (updates: Partial<RecipeQualityStandards>) => {
    onChange({
      qualityStandards: { ...recipe.qualityStandards, ...updates }
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create file path: org_id/recipes/recipe_id/quality/timestamp_filename
      const timestamp = Date.now();
      const filePath = `${recipe.organizationId}/recipes/${recipe.id}/quality/${timestamp}_${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('recipe-media')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(filePath);

      // Add image URL to quality standards
      updateQualityStandards({
        appearance: {
          ...recipe.qualityStandards.appearance,
          imageUrls: [...(recipe.qualityStandards.appearance.imageUrls || []), publicUrl]
        }
      });

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addTexturePoint = () => {
    const point = prompt('Enter texture quality point:');
    if (!point) return;

    updateQualityStandards({
      texture: [...(recipe.qualityStandards.texture || []), point]
    });
  };

  const removeTexturePoint = (index: number) => {
    const points = recipe.qualityStandards.texture?.filter((_, i) => i !== index);
    updateQualityStandards({ texture: points });
  };

  const addTastePoint = () => {
    const point = prompt('Enter taste quality point:');
    if (!point) return;

    updateQualityStandards({
      taste: [...(recipe.qualityStandards.taste || []), point]
    });
  };

  const removeTastePoint = (index: number) => {
    const points = recipe.qualityStandards.taste?.filter((_, i) => i !== index);
    updateQualityStandards({ taste: points });
  };

  const addAromaPoint = () => {
    const point = prompt('Enter aroma quality point:');
    if (!point) return;

    updateQualityStandards({
      aroma: [...(recipe.qualityStandards.aroma || []), point]
    });
  };

  const removeAromaPoint = (index: number) => {
    const points = recipe.qualityStandards.aroma?.filter((_, i) => i !== index);
    updateQualityStandards({ aroma: points });
  };

  return (
    <div className="space-y-6">
      {/* Visual Standards */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary-400" />
          Visual Standards
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Appearance Description
            </label>
            <textarea
              value={recipe.qualityStandards.appearance.description}
              onChange={(e) => updateQualityStandards({
                appearance: {
                  ...recipe.qualityStandards.appearance,
                  description: e.target.value
                }
              })}
              className="input w-full h-24"
              placeholder="Describe the expected visual appearance..."
            />
          </div>

          {/* Reference Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">
                Reference Images
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-ghost text-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </label>
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {recipe.qualityStandards.appearance.imageUrls?.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Quality standard ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      const urls = recipe.qualityStandards.appearance.imageUrls?.filter((_, i) => i !== index);
                      updateQualityStandards({
                        appearance: {
                          ...recipe.qualityStandards.appearance,
                          imageUrls: urls
                        }
                      });
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Texture Standards */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            Texture Standards
          </h3>
          <button
            onClick={addTexturePoint}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Texture Point
          </button>
        </div>
        <div className="space-y-2">
          {recipe.qualityStandards.texture?.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                type="text"
                value={point}
                onChange={(e) => {
                  const points = [...(recipe.qualityStandards.texture || [])];
                  points[index] = e.target.value;
                  updateQualityStandards({ texture: points });
                }}
                className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none"
                placeholder="Describe texture quality point..."
              />
              <button
                onClick={() => removeTexturePoint(index)}
                className="text-gray-500 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Taste Standards */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-green-400" />
            Taste Standards
          </h3>
          <button
            onClick={addTastePoint}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Taste Point
          </button>
        </div>
        <div className="space-y-2">
          {recipe.qualityStandards.taste?.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <input
                type="text"
                value={point}
                onChange={(e) => {
                  const points = [...(recipe.qualityStandards.taste || [])];
                  points[index] = e.target.value;
                  updateQualityStandards({ taste: points });
                }}
                className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none"
                placeholder="Describe taste quality point..."
              />
              <button
                onClick={() => removeTastePoint(index)}
                className="text-gray-500 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Aroma Standards */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-purple-400" />
            Aroma Standards
          </h3>
          <button
            onClick={addAromaPoint}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Aroma Point
          </button>
        </div>
        <div className="space-y-2">
          {recipe.qualityStandards.aroma?.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
            >
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <input
                type="text"
                value={point}
                onChange={(e) => {
                  const points = [...(recipe.qualityStandards.aroma || [])];
                  points[index] = e.target.value;
                  updateQualityStandards({ aroma: points });
                }}
                className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none"
                placeholder="Describe aroma quality point..."
              />
              <button
                onClick={() => removeAromaPoint(index)}
                className="text-gray-500 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Temperature Standards */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          Temperature Standards
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Target Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.qualityStandards.temperature.value}
                onChange={(e) => updateQualityStandards({
                  temperature: {
                    ...recipe.qualityStandards.temperature,
                    value: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                step="0.1"
              />
              <select
                value={recipe.qualityStandards.temperature.unit}
                onChange={(e) => updateQualityStandards({
                  temperature: {
                    ...recipe.qualityStandards.temperature,
                    unit: e.target.value as 'F' | 'C'
                  }
                })}
                className="input w-20"
              >
                <option value="F">°F</option>
                <option value="C">°C</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tolerance (±)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.qualityStandards.temperature.tolerance}
                onChange={(e) => updateQualityStandards({
                  temperature: {
                    ...recipe.qualityStandards.temperature,
                    tolerance: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                min="0"
                step="0.1"
              />
              <div className="input w-20 bg-gray-700 flex items-center justify-center">
                {recipe.qualityStandards.temperature.unit}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Acceptable Range
            </label>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-white">
                {recipe.qualityStandards.temperature.value - recipe.qualityStandards.temperature.tolerance}° - 
                {recipe.qualityStandards.temperature.value + recipe.qualityStandards.temperature.tolerance}°
                {recipe.qualityStandards.temperature.unit}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plating Standards */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-rose-400" />
          Plating Standards
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Plating Instructions
            </label>
            <textarea
              value={recipe.qualityStandards.platingInstructions?.description || ''}
              onChange={(e) => updateQualityStandards({
                platingInstructions: {
                  ...recipe.qualityStandards.platingInstructions,
                  description: e.target.value
                }
              })}
              className="input w-full h-32"
              placeholder="Describe plating instructions in detail..."
            />
          </div>

          {/* Plating Reference Image */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Plating Reference Image
            </label>
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {recipe.qualityStandards.platingInstructions?.imageUrl ? (
                <>
                  <img
                    src={recipe.qualityStandards.platingInstructions.imageUrl}
                    alt="Plating reference"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => updateQualityStandards({
                      platingInstructions: {
                        ...recipe.qualityStandards.platingInstructions,
                        imageUrl: undefined
                      }
                    })}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="plating-image"
                  />
                  <label
                    htmlFor="plating-image"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-500">
                      Upload plating reference image
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quality Control Points */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Quality Control Points
        </h3>
        <div className="space-y-4">
          {recipe.steps
            .filter(step => step.isQualityControlPoint || step.isCriticalControlPoint)
            .map((step, index) => (
              <div
                key={step.id}
                className={`bg-gray-800/50 rounded-lg p-4 ${
                  step.isCriticalControlPoint ? 'border border-rose-500/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {step.isCriticalControlPoint ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">Step {step.order}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        step.isCriticalControlPoint 
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {step.isCriticalControlPoint ? 'Critical Control Point' : 'Quality Control Point'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{step.instruction}</p>
                    <div className="space-y-2">
                      {step.qualityChecks?.map((check, checkIndex) => (
                        <div
                          key={checkIndex}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};