import Dexie, { Table } from 'dexie';

// Types
export interface UserProfile {
  id?: number;
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female' | 'other';
  age: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  createdAt: Date;
  updatedAt: Date;
}

export interface MealLog {
  id?: number;
  description: string;
  protein: number; // grams
  carbs: number;
  fats: number;
  calories: number;
  isAIEstimated: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutLog {
  id?: number;
  description: string;
  caloriesBurned: number;
  duration: number; // minutes
  isAIEstimated: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaterLog {
  id?: number;
  amount: number; // ml
  timestamp: Date;
  createdAt: Date;
}

export interface SleepLog {
  id?: number;
  duration: number; // hours
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  date: string; // YYYY-MM-DD
  source: 'manual' | 'google_fit';
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  id?: number;
  geminiApiKey: string;
  googleFitConnected: boolean;
  theme: 'light' | 'dark' | 'system';
  updatedAt: Date;
}

export interface DailyTargets {
  id?: number;
  waterTarget: number; // ml
  sleepTarget: number; // hours
  calorieTarget: number;
  proteinTarget: number; // grams
  updatedAt: Date;
}

// Database class
class HealthTrackerDB extends Dexie {
  userProfile!: Table<UserProfile, number>;
  meals!: Table<MealLog, number>;
  workouts!: Table<WorkoutLog, number>;
  water!: Table<WaterLog, number>;
  sleep!: Table<SleepLog, number>;
  settings!: Table<AppSettings, number>;
  targets!: Table<DailyTargets, number>;
  constructor() {
    super('HealthTrackerDB');

    this.version(1).stores({
      userProfile: '++id, createdAt, updatedAt',
      meals: '++id, timestamp, createdAt, updatedAt',
      workouts: '++id, timestamp, createdAt, updatedAt',
      water: '++id, timestamp, createdAt',
      sleep: '++id, date, createdAt, updatedAt',
      settings: '++id, updatedAt',
      targets: '++id, updatedAt'
    });
  }
}

// Export singleton instance
export const db = new HealthTrackerDB();