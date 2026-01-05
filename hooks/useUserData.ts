// hooks/useUserData.ts
// Hook para obtener y gestionar los datos del usuario desde Supabase

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

export const useUserData = () => {
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .select('calories, protein, carbs, fat')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (mealsError) throw mealsError;

      // Calcular totales de comidas
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

      // Obtener entrenamientos del día
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('calories_burned')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (workoutsError) throw workoutsError;

      const totalWorkoutCalories = (workouts || []).reduce(
        (sum, w) => sum + Number(w.calories_burned),
        0
      );

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

  return {
    profile,
    weightHistory,
    dailyStats,
    loading,
    error,
    refresh,
  };
};