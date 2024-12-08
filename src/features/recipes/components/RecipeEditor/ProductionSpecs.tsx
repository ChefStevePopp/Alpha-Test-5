import React from 'react';
import { Clock, Thermometer, Scale, AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { Recipe, RecipeStep } from '../../types/recipe';

interface ProductionSpecsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const ProductionSpecs: React.FC<ProductionSpecsProps> = ({ recipe, onChange }) => {
  const handleTimeChange = (field: 'prepTime' | 'cookTime' | 'restTime', value: number) => {
    onChange({
      [field]: value,
      totalTime: (field === 'prepTime' ? value : recipe.prepTime) +
                (field === 'cookTime' ? value : recipe.cookTime) +
                (field === 'restTime' ? value : recipe.restTime || 0)
    });
  };

  const handleStepChange = (index: number, updates: Partial<RecipeStep>) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    onChange({ steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: RecipeStep = {
      id: `step-${Date.now()}`,
      order: recipe.steps.length + 1,
      instruction: '',
      timeInMinutes: 0,
      equipment: [],
      qualityChecks: []
    };
    onChange({ steps: [...recipe.steps, newStep] });
  };

  const removeStep = (index: number) => {
    const updatedSteps = recipe.steps.filter((_, i) => i !== index);
    onChange({ steps: updatedSteps });
  };

  return (
    <div className="space-y-6">
      {/* Timing Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          Time Requirements
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Prep Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.prepTime}
              onChange={(e) => handleTimeChange('prepTime', parseInt(e.target.value))}
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Cook Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.cookTime}
              onChange={(e) => handleTimeChange('cookTime', parseInt(e.target.value))}
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Rest/Cooling Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.restTime || 0}
              onChange={(e) => handleTimeChange('restTime', parseInt(e.target.value))}
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Time</span>
            <span className="text-xl font-medium text-white">
              {recipe.totalTime} minutes
            </span>
          </div>
        </div>
      </div>

      {/* Production Steps */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Production Steps</h3>
          <button
            onClick={addStep}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </button>
        </div>
        <div className="space-y-4">
          {recipe.steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-800/50 rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium text-primary-400">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step.instruction}
                    onChange={(e) => handleStepChange(index, { instruction: e.target.value })}
                    className="input flex-1"
                    placeholder="Enter step instruction..."
                  />
                </div>
                <button
                  onClick={() => removeStep(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Time Required (minutes)
                  </label>
                  <input
                    type="number"
                    value={step.timeInMinutes || 0}
                    onChange={(e) => handleStepChange(index, { timeInMinutes: parseInt(e.target.value) })}
                    className="input w-full"
                    min="0"
                    step="1"
                  />
                </div>
                {step.temperature && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Temperature
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={step.temperature.value}
                        onChange={(e) => handleStepChange(index, {
                          temperature: {
                            ...step.temperature,
                            value: parseInt(e.target.value)
                          }
                        })}
                        className="input flex-1"
                      />
                      <select
                        value={step.temperature.unit}
                        onChange={(e) => handleStepChange(index, {
                          temperature: {
                            ...step.temperature,
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
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Required Equipment
                  </label>
                  <select
                    multiple
                    value={step.equipment || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      handleStepChange(index, { equipment: selected });
                    }}
                    className="input w-full h-24"
                  >
                    {recipe.equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Quality Checks
                </label>
                <div className="flex flex-wrap gap-2">
                  {step.qualityChecks?.map((check, checkIndex) => (
                    <div
                      key={checkIndex}
                      className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1"
                    >
                      <span className="text-sm text-gray-300">{check}</span>
                      <button
                        onClick={() => {
                          const updatedChecks = step.qualityChecks?.filter((_, i) => i !== checkIndex);
                          handleStepChange(index, { qualityChecks: updatedChecks });
                        }}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const check = prompt('Enter quality check:');
                      if (check) {
                        handleStepChange(index, {
                          qualityChecks: [...(step.qualityChecks || []), check]
                        });
                      }
                    }}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Check
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={step.isQualityControlPoint}
                    onChange={(e) => handleStepChange(index, { isQualityControlPoint: e.target.checked })}
                    className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
                  />
                  <span className="text-sm text-gray-300">Quality Control Point</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={step.isCriticalControlPoint}
                    onChange={(e) => handleStepChange(index, { isCriticalControlPoint: e.target.checked })}
                    className="form-checkbox rounded bg-gray-700 border-gray-600 text-rose-500"
                  />
                  <span className="text-sm text-gray-300">Critical Control Point</span>
                </label>
              </div>

              {step.isCriticalControlPoint && (
                <div className="bg-rose-500/10 rounded-lg p-4 mt-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="text-rose-400 font-medium">Critical Control Point</p>
                    <p className="text-sm text-gray-300 mt-1">
                      This step requires specific monitoring and documentation. Ensure all quality checks are performed and recorded.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expected Yield */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          Expected Yield
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Expected Weight
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={recipe.yield.expectedWeight?.value || 0}
                onChange={(e) => onChange({
                  yield: {
                    ...recipe.yield,
                    expectedWeight: {
                      value: parseFloat(e.target.value),
                      unit: recipe.yield.expectedWeight?.unit || 'g'
                    }
                  }
                })}
                className="input flex-1"
                min="0"
                step="0.1"
              />
              <select
                value={recipe.yield.expectedWeight?.unit || 'g'}
                onChange={(e) => onChange({
                  yield: {
                    ...recipe.yield,
                    expectedWeight: {
                      value: recipe.yield.expectedWeight?.value || 0,
                      unit: e.target.value as 'g' | 'kg' | 'oz' | 'lb'
                    }
                  }
                })}
                className="input w-24"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="oz">oz</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Portion Size
            </label>
            <input
              type="text"
              value={recipe.yield.portionSize || ''}
              onChange={(e) => onChange({
                yield: { ...recipe.yield, portionSize: e.target.value }
              })}
              className="input w-full"
              placeholder="e.g., 6 oz portion, 2 pieces per serving"
            />
          </div>
        </div>
      </div>

      {/* Temperature Requirements */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          Temperature Requirements
        </h3>
        <div className="space-y-4">
          {recipe.steps.filter(step => step.temperature).map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">Step {index + 1}</h4>
                  <p className="text-sm text-gray-400 mt-1">{step.instruction}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium text-blue-400">
                    {step.temperature?.value}°{step.temperature?.unit}
                  </span>
                </div>
              </div>
              {step.isCriticalControlPoint && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Critical Temperature Control Point</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};