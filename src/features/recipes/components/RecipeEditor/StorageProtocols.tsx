import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Box, 
  Clock, 
  AlertTriangle,
  Printer,
  Calendar,
  Info
} from 'lucide-react';
import type { Recipe } from '../../types/recipe';

interface StorageProtocolsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const StorageProtocols: React.FC<StorageProtocolsProps> = ({ recipe, onChange }) => {
  const updateStorage = (updates: Partial<typeof recipe.storage>) => {
    onChange({
      storage: { ...recipe.storage, ...updates }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date.getTime() + (recipe.storage.shelfLife.value * 
      (recipe.storage.shelfLife.unit === 'hours' ? 3600000 : 
       recipe.storage.shelfLife.unit === 'days' ? 86400000 : 
       recipe.storage.shelfLife.unit === 'weeks' ? 604800000 : 0)
    )).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Temperature Controls */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          Temperature Controls
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Minimum Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage.temperature.min}
                onChange={(e) => updateStorage({
                  temperature: {
                    ...recipe.storage.temperature,
                    min: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                step="0.1"
              />
              <select
                value={recipe.storage.temperature.unit}
                onChange={(e) => updateStorage({
                  temperature: {
                    ...recipe.storage.temperature,
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
              Maximum Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage.temperature.max}
                onChange={(e) => updateStorage({
                  temperature: {
                    ...recipe.storage.temperature,
                    max: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                step="0.1"
              />
              <div className="input w-20 bg-gray-700 flex items-center justify-center">
                {recipe.storage.temperature.unit}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Critical Control
            </label>
            <select
              value={recipe.storage.temperature.critical || 'none'}
              onChange={(e) => updateStorage({
                temperature: {
                  ...recipe.storage.temperature,
                  critical: e.target.value === 'none' ? undefined : e.target.value
                }
              })}
              className="input w-full"
            >
              <option value="none">No Critical Control</option>
              <option value="min">Minimum Temperature</option>
              <option value="max">Maximum Temperature</option>
              <option value="both">Both Min & Max</option>
            </select>
          </div>
        </div>
      </div>

      {/* Humidity Controls */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-400" />
          Humidity Controls
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Minimum Humidity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage.humidity?.min || 0}
                onChange={(e) => updateStorage({
                  humidity: {
                    ...recipe.storage.humidity,
                    min: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                min="0"
                max="100"
                step="1"
              />
              <div className="input w-12 bg-gray-700 flex items-center justify-center">
                %
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Maximum Humidity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage.humidity?.max || 0}
                onChange={(e) => updateStorage({
                  humidity: {
                    ...recipe.storage.humidity,
                    max: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                min="0"
                max="100"
                step="1"
              />
              <div className="input w-12 bg-gray-700 flex items-center justify-center">
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Storage */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-amber-400" />
          Physical Storage
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Storage Location
            </label>
            <select
              value={recipe.storage.location}
              onChange={(e) => updateStorage({ location: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select location...</option>
              <option value="walk_in_cooler">Walk-in Cooler</option>
              <option value="walk_in_freezer">Walk-in Freezer</option>
              <option value="dry_storage">Dry Storage</option>
              <option value="line_cooler">Line Cooler</option>
              <option value="prep_station">Prep Station</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Container Type
            </label>
            <select
              value={recipe.storage.container}
              onChange={(e) => updateStorage({ container: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select container...</option>
              <option value="cambro">Cambro</option>
              <option value="hotel_pan">Hotel Pan</option>
              <option value="lexan">Lexan</option>
              <option value="sheet_pan">Sheet Pan</option>
              <option value="deli_container">Deli Container</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Container Size
            </label>
            <select
              value={recipe.storage.containerSize}
              onChange={(e) => updateStorage({ containerSize: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select size...</option>
              <option value="sixth">1/6 Pan</option>
              <option value="ninth">1/9 Pan</option>
              <option value="third">1/3 Pan</option>
              <option value="half">1/2 Pan</option>
              <option value="full">Full Pan</option>
              <option value="2qt">2 Qt Container</option>
              <option value="4qt">4 Qt Container</option>
              <option value="6qt">6 Qt Container</option>
              <option value="8qt">8 Qt Container</option>
              <option value="12qt">12 Qt Container</option>
              <option value="22qt">22 Qt Container</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Special Instructions
            </label>
            <textarea
              value={recipe.storage.specialInstructions?.join('\n') || ''}
              onChange={(e) => updateStorage({
                specialInstructions: e.target.value.split('\n').filter(Boolean)
              })}
              className="input w-full h-24"
              placeholder="Enter any special storage instructions..."
            />
          </div>
        </div>
      </div>

      {/* Shelf Life */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-400" />
          Shelf Life
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Duration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage.shelfLife.value}
                onChange={(e) => updateStorage({
                  shelfLife: {
                    ...recipe.storage.shelfLife,
                    value: parseInt(e.target.value)
                  }
                })}
                className="input flex-1"
                min="1"
                step="1"
                required
              />
              <select
                value={recipe.storage.shelfLife.unit}
                onChange={(e) => updateStorage({
                  shelfLife: {
                    ...recipe.storage.shelfLife,
                    unit: e.target.value as 'hours' | 'days' | 'weeks'
                  }
                })}
                className="input w-32"
                required
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Example Dates
            </label>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">If made today:</span>
                <span className="text-white">{formatDate(new Date())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Label Requirements */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-400" />
            Label Requirements
          </h3>
          <button
            onClick={() => {
              // TODO: Implement label preview/print functionality
            }}
            className="btn-ghost text-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Preview Label
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Required Information</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  Prep Date & Time
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  Use By Date & Time
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <Info className="w-4 h-4 text-amber-400" />
                  Product Name & Batch
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Allergen Warnings
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Storage Instructions</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  Store between {recipe.storage.temperature.min}°{recipe.storage.temperature.unit} and{' '}
                  {recipe.storage.temperature.max}°{recipe.storage.temperature.unit}
                </p>
                {recipe.storage.humidity && (
                  <p className="text-gray-300">
                    Maintain humidity between {recipe.storage.humidity.min}% and {recipe.storage.humidity.max}%
                  </p>
                )}
                {recipe.storage.specialInstructions?.map((instruction, index) => (
                  <p key={index} className="text-gray-300">
                    • {instruction}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* FIFO Warning */}
          <div className="bg-yellow-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium">FIFO Compliance Required</p>
                <p className="text-sm text-gray-300 mt-1">
                  This item must be stored following First In, First Out principles.
                  Always rotate stock and use oldest product first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};