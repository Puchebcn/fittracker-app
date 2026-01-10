/**
 * Hook para buscar y gestionar alimentos
 * Busca en la base de datos de alimentos (foods table)
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Food {
  id: number;
  name: string;
  category: string;
  calories_per_100: number;
  protein_per_100: number;
  carbs_per_100: number;
  fat_per_100: number;
  unit: string;
  tags: string[];
  is_custom: boolean;
  user_id: string | null;
}

export interface FoodWithQuantity extends Food {
  quantity: number;
  calculated: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFoods = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('foods')
          .select('*')
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        if (isMounted) {
          setFoods(data || []);
        }
      } catch (err: any) {
        console.error('Error loading foods:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFoods();

    return () => {
      isMounted = false;
    };
  }, []); // Solo se ejecuta UNA VEZ al montar

  // Buscar alimentos por término
  const searchFoods = (searchTerm: string): Food[] => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return foods
      .filter(food => food.name.toLowerCase().includes(term))
      .slice(0, 10);
  };

  // Filtrar por categoría
  const getFoodsByCategory = (category: string): Food[] => {
    return foods.filter(food => food.category === category);
  };

  // Calcular macros según cantidad
  const calculateNutrition = (food: Food, quantity: number) => {
    const factor = quantity / 100;
    return {
      calories: Math.round(food.calories_per_100 * factor),
      protein: Math.round(food.protein_per_100 * factor),
      carbs: Math.round(food.carbs_per_100 * factor),
      fat: Math.round(food.fat_per_100 * factor),
    };
  };

  return {
    foods,
    loading,
    error,
    searchFoods,
    getFoodsByCategory,
    calculateNutrition,
  };
}