import type { AllergenType } from '@/features/allergens/types';

export interface RecipeIngredient {
  id: string;
  type: 'raw' | 'prepared';
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  cost: number;
  preparedItemId?: string;
}

export interface RecipeStep {
  id: string;
  order: number;
  instruction: string;
  notes?: string;
  warningLevel?: 'info' | 'warning' | 'critical';
  timeInMinutes?: number;
  equipment?: string[];
  qualityChecks?: string[];
  mediaUrls?: string[];
  isQualityControlPoint?: boolean;
  isCriticalControlPoint?: boolean;
  temperature?: {
    value: number;
    unit: 'F' | 'C';
  };
}

export interface RecipeMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
  timestamp?: number;
  stepId?: string;
  tags?: string[];
  isPrimary?: boolean;
}

export interface RecipeYield {
  amount: number;
  unit: 'portion' | 'serving' | 'kg' | 'g' | 'each';
  expectedWeight?: {
    value: number;
    unit: 'g' | 'kg' | 'oz' | 'lb';
  };
  portionSize?: string;
}

export interface RecipeQualityStandards {
  appearance: {
    description: string;
    imageUrls?: string[];
  };
  texture: string[];
  taste: string[];
  aroma: string[];
  temperature: {
    value: number;
    unit: 'F' | 'C';
    tolerance: number;
  };
  platingInstructions?: {
    description: string;
    imageUrl?: string;
  };
}

export interface RecipeTraining {
  requiredSkillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certificationRequired?: string[];
  commonErrors?: string[];
  keyTechniques?: string[];
  safetyProtocols?: string[];
  qualityStandards?: string[];
  notes?: string;
}

export interface Recipe {
  id: string;
  organizationId: string;
  type: 'prepared' | 'final';
  name: string;
  description: string;
  majorGroup?: string;
  category?: string;
  subCategory?: string;
  station: string;
  
  // Storage & Handling
  storageArea: string;
  container: string;
  containerType: string;
  shelfLife: string;
  
  // Timing
  prepTime: number;
  cookTime: number;
  restTime?: number;
  totalTime: number;
  
  // Recipe Details
  recipeUnitRatio: string;
  unitType: string;
  yield: RecipeYield;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  media: RecipeMedia[];
  
  // Allergens & Safety
  allergenInfo: {
    contains: AllergenType[];
    mayContain: AllergenType[];
    crossContactRisk: AllergenType[];
  };
  
  // Quality & Training
  qualityStandards: RecipeQualityStandards;
  training: RecipeTraining;
  
  // Equipment
  equipment: {
    id: string;
    name: string;
    station: string;
    isRequired: boolean;
    specifications?: string;
    alternatives?: string[];
  }[];
  
  // Costing
  laborCostPerHour: number;
  ingredientCost: number;
  totalCost: number;
  costPerUnit: number;
  costPerRatioUnit: number;
  costPerServing: number;
  targetCostPercent: number;
  
  // Versioning
  version: string;
  versions: {
    id: string;
    version: string;
    createdAt: string;
    createdBy: string;
    changes: string[];
    revertedFrom?: string;
    approved?: {
      by: string;
      at: string;
      notes?: string;
    };
  }[];
  
  // Metadata
  notes?: string;
  lastModified: string;
  modifiedBy: string;
}