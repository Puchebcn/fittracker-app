/**
 * Hook para gestionar las comidas del día
 * Permite cargar, añadir y eliminar comidas de la base de datos
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface MealEntry {
  id: string;
  user_id: string;
  food_id: number | null;
  meal_type: 'desayuno' | 'media_manana' | 'comida' | 'merienda' | 'cena';
  food_name?: string; // ✅ OPCIONAL - no existe en la BD actualmente
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function useMeals(date?: Date) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || new Date();

  useEffect(() => {
    let isMounted = true;

    const loadMeals = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Obtener inicio y fin del día
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error: fetchError } = await supabase
          .from('meal_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startOfDay.toISOString())
          .lte('logged_at', endOfDay.toISOString())
          .order('logged_at', { ascending: true });

        if (fetchError) throw fetchError;

        if (isMounted) {
          setMeals(data || []);
        }
      } catch (err: any) {
        console.error('Error loading meals:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMeals();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Solo depende del user id

  const addMultipleMeals = async (mealsToAdd: Omit<MealEntry, 'id' | 'user_id' | 'logged_at'>[]) => {
    if (!user) return;

    try {
      setError(null);

      const now = new Date().toISOString();
      const mealsData = mealsToAdd.map(meal => ({
        user_id: user.id,
        ...meal,
        logged_at: now,
      }));

      const { data, error: insertError } = await supabase
        .from('meal_entries')
        .insert(mealsData)
        .select();

      if (insertError) throw insertError;

      setMeals([...meals, ...(data || [])]);
      return data;
    } catch (err: any) {
      console.error('Error adding meals:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteMeal = async (mealId: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('meal_entries')
        .delete()
        .eq('id', mealId);

      if (deleteError) throw deleteError;

      setMeals(meals.filter(m => m.id !== mealId));
    } catch (err: any) {
      console.error('Error deleting meal:', err);
      setError(err.message);
      throw err;
    }
  };

  // Calcular totales del día
  const dailyTotals: DailyTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + Number(meal.calories || 0),
      protein: acc.protein + Number(meal.protein || 0),
      carbs: acc.carbs + Number(meal.carbs || 0),
      fat: acc.fat + Number(meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Agrupar comidas por tipo
  const mealsByType = {
    desayuno: meals.filter(m => m.meal_type === 'desayuno'),
    media_manana: meals.filter(m => m.meal_type === 'media_manana'),
    comida: meals.filter(m => m.meal_type === 'comida'),
    merienda: meals.filter(m => m.meal_type === 'merienda'),
    cena: meals.filter(m => m.meal_type === 'cena'),
  };

  return {
    meals,
    mealsByType,
    dailyTotals,
    loading,
    error,
    addMultipleMeals,
    deleteMeal,
  };
}