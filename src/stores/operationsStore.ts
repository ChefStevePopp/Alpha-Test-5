import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { OperationsSettings } from '@/types/operations';
import toast from 'react-hot-toast';

interface OperationsStore {
  settings: OperationsSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<OperationsSettings>) => Promise<void>;
}

export const useOperationsStore = create<OperationsStore>((set) => ({
  settings: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // First get operations settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('operations_settings')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

      // Then get food relationships data
      const { data: groupsData, error: groupsError } = await supabase
        .from('food_category_groups')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('sort_order');

      if (groupsError) throw groupsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('food_categories')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from('food_sub_categories')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('sort_order');

      if (subCategoriesError) throw subCategoriesError;

      // Combine all data
      const settings: OperationsSettings = {
        ...(settingsData || {}),
        food_category_groups: groupsData || [],
        food_categories: categoriesData || [],
        food_sub_categories: subCategoriesData || [],
        // Default values if no settings exist
        storage_areas: settingsData?.storage_areas || ['Walk-in Cooler', 'Walk-in Freezer', 'Dry Storage'],
        kitchen_stations: settingsData?.kitchen_stations || ['Grill', 'Prep', 'Line'],
        shelf_life_options: settingsData?.shelf_life_options || ['1 Day', '3 Days', '1 Week'],
        storage_containers: settingsData?.storage_containers || ['Cambro', 'Hotel Pan', 'Lexan'],
        container_types: settingsData?.container_types || ['1/6 Pan', '1/3 Pan', 'Full Pan'],
        vendors: settingsData?.vendors || ['US Foods', 'Sysco', 'Local Supplier']
      };

      set({ settings, error: null });
    } catch (error) {
      console.error('Error fetching operations settings:', error);
      set({ error: 'Failed to load operations settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ isSaving: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('operations_settings')
        .upsert({
          organization_id: user.user_metadata.organizationId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id'
        });

      if (error) throw error;

      set(state => ({
        settings: state.settings ? {
          ...state.settings,
          ...updates
        } : updates as OperationsSettings
      }));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving operations settings:', error);
      toast.error('Failed to save settings');
    } finally {
      set({ isSaving: false });
    }
  }
}));