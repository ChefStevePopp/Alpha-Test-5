import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { useOperationsStore } from '@/stores/operationsStore';
import toast from 'react-hot-toast';

interface SettingsManagerProps {
  group: {
    id: string;
    name: string;
    icon: React.ComponentType;
    color: string;
    description: string;
    categories: { id: string; label: string }[];
  };
  activeCategory: string | null;
  settings: any | null;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  group,
  activeCategory,
  settings
}) => {
  const [editingItem, setEditingItem] = useState<{ index: number; value: string } | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const { updateSettings } = useOperationsStore();

  const handleAddItem = async () => {
    if (!newItemName.trim() || !activeCategory) return;

    try {
      const updatedSettings = { ...settings };
      if (!updatedSettings[activeCategory]) {
        updatedSettings[activeCategory] = [];
      }
      updatedSettings[activeCategory].push(newItemName.trim());

      await updateSettings(updatedSettings);
      setNewItemName('');
      setIsAddingItem(false);
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleUpdateItem = async (index: number, newValue: string) => {
    if (!activeCategory) return;

    try {
      const updatedSettings = { ...settings };
      updatedSettings[activeCategory][index] = newValue;

      await updateSettings(updatedSettings);
      setEditingItem(null);
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (index: number) => {
    if (!activeCategory || !window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const updatedSettings = { ...settings };
      updatedSettings[activeCategory].splice(index, 1);

      await updateSettings(updatedSettings);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const displayItems = activeCategory && settings?.[activeCategory];

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/OperationsManager/SettingsManager.tsx
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{group.name}</h3>
          <p className="text-gray-400 mt-1">{group.description}</p>
        </div>
        <button
          onClick={() => setIsAddingItem(true)}
          className="btn-ghost"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {isAddingItem && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="input flex-1"
              placeholder="Enter item name"
              autoFocus
            />
            <button
              onClick={handleAddItem}
              className="btn-primary"
              disabled={!newItemName.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setNewItemName('');
              }}
              className="btn-ghost"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.isArray(displayItems) && displayItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 group w-full"
          >
            {editingItem?.index === index ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editingItem.value}
                  onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                  className="input flex-1 min-w-0"
                  autoFocus
                />
                <div className="flex-shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateItem(index, editingItem.value)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-gray-300 truncate">{item}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem({ index, value: item })}
                    className="text-gray-400 hover:text-primary-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(!displayItems || displayItems.length === 0) && (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400">No items found. Add some using the button above.</p>
        </div>
      )}
    </div>
  );
};