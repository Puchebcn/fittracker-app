// hooks/useUserData.ts
// Hook para obtener y gestionar los datos del usuario desde Supabase
// VERSIÓN MEJORADA: Añade workouts completos y cálculo de targets

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateWorkoutBonus,
  calculateAge,
  calculateMacros,
} from '../lib/calculations';

// ============================================================================
// INTERFACES EXISTENTES (mantienen compatibilidad)
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birth_date: string;
  height_cm: number;
  start_weight: number;
  current_weight: number;
  target_weight: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  measured_at: string;
}

export interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  steps: number;
  waterGlasses: number;
  workoutCalories: number;
}

// ============================================================================
// NUEVAS INTERFACES (para workout.tsx y futuras pantallas)
// ============================================================================

export interface MealEntry {
  id: string;
  food_id: string;
  meal_type: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}

export interface Workout {
  id: string;
  workout_type: string;
  name: string;
  duration_min: number;
  calories_burned: number;
  steps_added: number;
  logged_at: string;
}

export interface TodayStats {
  meals: MealEntry[];
  workouts: Workout[];
  steps: number;
  waterGlasses: number;
}

export interface Targets {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  workoutBonus: number;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useUserData = () => {
  const { user } = useAuth();
  
  // Estados existentes (mantienen compatibilidad)
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    steps: 0,
    waterGlasses: 0,
    workoutCalories: 0,
  });
  
  // Nuevos estados
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FUNCIONES DE FETCH (mantienen compatibilidad)
  // ============================================================================

  // Obtener perfil del usuario desde tabla 'users'
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error al obtener perfil:', err);
      setError(err.message);
    }
  };

  // Obtener historial de peso (últimas 10 entradas)
  const fetchWeightHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weight_history')
        .select('id, weight, measured_at')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Invertir para que el más antiguo esté primero
      setWeightHistory(data ? data.reverse() : []);
    } catch (err: any) {
      console.error('Error al obtener historial de peso:', err);
      setError(err.message);
    }
  };

  // Obtener estadísticas del día actual
  const fetchDailyStats = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // Obtener comidas del día
      const { data: meals, error: mealsError } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (mealsError) throw mealsError;

      // Guardar comidas completas (NUEVO)
      setTodayMeals(meals || []);

      // Calcular totales de comidas (MANTIENE COMPATIBILIDAD)
      const mealTotals = (meals || []).reduce(
        (acc, meal) => ({
          calories: acc.calories + Number(meal.calories),
          protein: acc.protein + Number(meal.protein),
          carbs: acc.carbs + Number(meal.carbs),
          fat: acc.fat + Number(meal.fat),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Obtener pasos del día
      const { data: stepsData, error: stepsError } = await supabase
        .from('steps_log')
        .select('steps')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: false })
        .limit(1);

      if (stepsError) throw stepsError;

      // Obtener agua del día
      const { data: waterData, error: waterError } = await supabase
        .from('water_log')
        .select('glasses')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: false })
        .limit(1);

      if (waterError) throw waterError;

      // Obtener entrenamientos del día (MEJORADO - obtiene datos completos)
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: false });

      if (workoutsError) throw workoutsError;

      // Guardar workouts completos (NUEVO)
      setTodayWorkouts(workouts || []);

      // Calcular total de calorías de entrenos (MANTIENE COMPATIBILIDAD)
      const totalWorkoutCalories = (workouts || []).reduce(
        (sum, w) => sum + Number(w.calories_burned),
        0
      );

      // Actualizar dailyStats (MANTIENE COMPATIBILIDAD)
      setDailyStats({
        totalCalories: mealTotals.calories,
        totalProtein: mealTotals.protein,
        totalCarbs: mealTotals.carbs,
        totalFat: mealTotals.fat,
        steps: stepsData?.[0]?.steps || 0,
        waterGlasses: waterData?.[0]?.glasses || 0,
        workoutCalories: totalWorkoutCalories,
      });
    } catch (err: any) {
      console.error('Error al obtener estadísticas del día:', err);
      setError(err.message);
    }
  };

  // Cargar todos los datos al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchWeightHistory(),
        fetchDailyStats(),
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Función para refrescar los datos
  const refresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchWeightHistory(),
      fetchDailyStats(),
    ]);
    setLoading(false);
  };

  // ============================================================================
  // NUEVAS PROPIEDADES COMPUTADAS (para workout.tsx y otras pantallas)
  // ============================================================================

  /**
   * todayStats: Datos completos del día (meals, workouts, steps, water)
   */
  const todayStats: TodayStats = useMemo(() => ({
    meals: todayMeals,
    workouts: todayWorkouts,
    steps: dailyStats.steps,
    waterGlasses: dailyStats.waterGlasses,
  }), [todayMeals, todayWorkouts, dailyStats.steps, dailyStats.waterGlasses]);

  /**
   * targets: Objetivos calculados (BMR, TDEE, calorías, macros)
   */
  const targets: Targets | null = useMemo(() => {
    if (!profile) return null;

    const age = calculateAge(profile.birth_date);
    const bmr = calculateBMR(profile.current_weight, profile.height_cm, age);
    const tdee = calculateTDEE(bmr, profile.activity_level);
    const workoutBonus = calculateWorkoutBonus(dailyStats.workoutCalories);
    const calories = calculateDailyCalorieTarget(tdee, 600, workoutBonus);
    const macros = calculateMacros(calories, profile.target_weight);

    return {
      bmr,
      tdee,
      calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      workoutBonus,
    };
  }, [profile, dailyStats.workoutCalories]);

  /**
   * userData: Alias de profile para compatibilidad con workout.tsx
   */
  const userData = profile;

  // ============================================================================
  // RETURN (mantiene compatibilidad + añade nuevas propiedades)
  // ============================================================================

  return {
    // ✅ Propiedades EXISTENTES (Dashboard las usa)
    profile,
    weightHistory,
    dailyStats,
    loading,
    error,
    refresh,
    
    // 🆕 Propiedades NUEVAS (workout.tsx y futuras pantallas las usan)
    userData,        // Alias de profile
    todayStats,      // Datos completos del día
    targets,         // Objetivos calculados
  };
};