import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Info, 
  CheckCircle2,
  Star,
  LightbulbIcon,
  Camera
} from 'lucide-react';
import type { Recipe, RecipeStep } from '../../types/recipe';

interface InstructionEditorProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const InstructionEditor: React.FC<InstructionEditorProps> = ({ recipe, onChange }) => {
  const [selectedStep, setSelectedStep] = useState<RecipeStep | null>(null);

  const addStep = () => {
    const newStep: RecipeStep = {
      id: `step-${Date.now()}`,
      order: recipe.steps.length + 1,
      instruction: '',
      notes: '',
      warningLevel: 'info',
      timeInMinutes: 0,
      equipment: [],
      qualityChecks: [],
      mediaUrls: []
    };

    onChange({
      steps: [...recipe.steps, newStep]
    });
  };

  const updateStep = (index: number, updates: Partial<RecipeStep>) => {
    const updatedSteps = recipe.steps.map((step, i) =>
      i === index ? { ...step, ...updates } : step
    );
    onChange({ steps: updatedSteps });
  };

  const deleteStep = (index: number) => {
    const updatedSteps = recipe.steps.filter((_, i) => i !== index);
    onChange({ steps: updatedSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= recipe.steps.length) return;

    const updatedSteps = [...recipe.steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Update order numbers
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });

    onChange({ steps: updatedSteps });
  };

  const addQualityCheck = (stepIndex: number) => {
    const check = prompt('Enter quality check criteria:');
    if (!check) return;

    updateStep(stepIndex, {
      qualityChecks: [...(recipe.steps[stepIndex].qualityChecks || []), check]
    });
  };

  const getWarningLevelStyles = (level: RecipeStep['warningLevel']) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/50';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Steps List */}
      <div className="space-y-4">
        {recipe.steps.map((step, index) => (
          <div
            key={step.id}
            className="card p-6 space-y-4"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary-400">
                  {index + 1}
                </span>
                <select
                  value={step.warningLevel || 'info'}
                  onChange={(e) => updateStep(index, {
                    warningLevel: e.target.value as RecipeStep['warningLevel']
                  })}
                  className="input bg-transparent border-none text-sm font-medium px-2"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    onClick={() => moveStep(index, 'up')}
                    className="btn-ghost p-1"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                )}
                {index < recipe.steps.length - 1 && (
                  <button
                    onClick={() => moveStep(index, 'down')}
                    className="btn-ghost p-1"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteStep(index)}
                  className="btn-ghost p-1 text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Instruction
                </label>
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(index, { instruction: e.target.value })}
                  className="input w-full h-24"
                  placeholder="Enter detailed instruction..."
                />
              </div>

              {/* Warning Callout */}
              {step.warningLevel && step.warningLevel !== 'info' && (
                <div className={`rounded-lg border p-4 ${getWarningLevelStyles(step.warningLevel)}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium capitalize">{step.warningLevel} Alert</p>
                      <p className="text-sm mt-1 text-gray-300">
                        {step.warningLevel === 'critical' 
                          ? 'This step requires special attention and documentation.'
                          : 'Pay extra attention to this step to ensure quality.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expert Tips */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Expert Tips
                </label>
                <div className="space-y-2">
                  {step.notes?.split('\n').map((tip, tipIndex) => (
                    <div
                      key={tipIndex}
                      className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-3"
                    >
                      <LightbulbIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <textarea
                        value={tip}
                        onChange={(e) => {
                          const tips = step.notes?.split('\n') || [];
                          tips[tipIndex] = e.target.value;
                          updateStep(index, { notes: tips.join('\n') });
                        }}
                        className="flex-1 bg-transparent border-none resize-none text-sm text-gray-300 focus:outline-none"
                        placeholder="Add expert tip..."
                      />
                      <button
                        onClick={() => {
                          const tips = step.notes?.split('\n').filter((_, i) => i !== tipIndex) || [];
                          updateStep(index, { notes: tips.join('\n') });
                        }}
                        className="text-gray-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const currentTips = step.notes?.split('\n').filter(Boolean) || [];
                      updateStep(index, {
                        notes: [...currentTips, ''].join('\n')
                      });
                    }}
                    className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tip
                  </button>
                </div>
              </div>

              {/* Quality Checks */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Quality Checks
                </label>
                <div className="space-y-2">
                  {step.qualityChecks?.map((check, checkIndex) => (
                    <div
                      key={checkIndex}
                      className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={check}
                        onChange={(e) => {
                          const checks = [...(step.qualityChecks || [])];
                          checks[checkIndex] = e.target.value;
                          updateStep(index, { qualityChecks: checks });
                        }}
                        className="flex-1 bg-transparent border-none text-sm text-gray-300 focus:outline-none"
                        placeholder="Quality check criteria..."
                      />
                      <button
                        onClick={() => {
                          const checks = step.qualityChecks?.filter((_, i) => i !== checkIndex) || [];
                          updateStep(index, { qualityChecks: checks });
                        }}
                        className="text-gray-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addQualityCheck(index)}
                    className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Quality Check
                  </button>
                </div>
              </div>

              {/* Media Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Step Media
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {step.mediaUrls?.map((url, mediaIndex) => (
                    <div
                      key={mediaIndex}
                      className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden"
                    >
                      {url.includes('youtube.com') ? (
                        <iframe
                          src={url}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Step ${index + 1} media`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        onClick={() => {
                          const media = step.mediaUrls?.filter((_, i) => i !== mediaIndex) || [];
                          updateStep(index, { mediaUrls: media });
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const url = prompt('Enter media URL:');
                      if (url) {
                        const media = [...(step.mediaUrls || []), url];
                        updateStep(index, { mediaUrls: media });
                      }
                    }}
                    className="aspect-video flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg hover:border-primary-500 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Success Criteria */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">
                    Success Criteria
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={step.isQualityControlPoint}
                        onChange={(e) => updateStep(index, {
                          isQualityControlPoint: e.target.checked
                        })}
                        className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
                      />
                      <span className="text-gray-300">Quality Control Point</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={step.isCriticalControlPoint}
                        onChange={(e) => updateStep(index, {
                          isCriticalControlPoint: e.target.checked
                        })}
                        className="form-checkbox rounded bg-gray-700 border-gray-600 text-rose-500"
                      />
                      <span className="text-gray-300">Critical Control Point</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Step Button */}
      <button
        onClick={addStep}
        className="btn-ghost w-full py-4 border-2 border-dashed border-gray-700 hover:border-primary-500"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Step
      </button>
    </div>
  );
};