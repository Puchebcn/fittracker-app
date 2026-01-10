/**
 * Pantalla de Nutrición - FitTracker
 * Con desayunos completos, altura completa y recomendaciones inteligentes
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useMeals } from '../../hooks/useMeals';
import { useFoods, Food } from '../../hooks/useFoods';
import { useUserData } from '../../hooks/useUserData';
import { calculateAge } from '../../lib/calculations';

const { width, height } = Dimensions.get('window');

// Desayunos completos predefinidos
const COMPLETE_BREAKFASTS = [
  {
    id: 1,
    name: 'Desayuno Proteico',
    icon: '🥚',
    description: 'Alto en proteína, bajo en carbohidratos',
    foods: [
      { name: 'Huevo entero', quantity: 200 }, // 2 huevos
      { name: 'Pavo pechuga', quantity: 50 },
      { name: 'Aguacate', quantity: 50 },
      { name: 'Pan integral', quantity: 30 },
    ],
  },
  {
    id: 2,
    name: 'Desayuno Energético',
    icon: '🥣',
    description: 'Perfecto para entrenar',
    foods: [
      { name: 'Avena', quantity: 50 },
      { name: 'Plátano', quantity: 100 },
      { name: 'Yogur griego 0%', quantity: 150 },
      { name: 'Almendras', quantity: 15 },
    ],
  },
  {
    id: 3,
    name: 'Desayuno Mediterráneo',
    icon: '🍞',
    description: 'Clásico y equilibrado',
    foods: [
      { name: 'Pan integral', quantity: 60 },
      { name: 'Aceite oliva', quantity: 10 },
      { name: 'Jamón serrano', quantity: 30 },
      { name: 'Tomate', quantity: 100 },
      { name: 'Naranja', quantity: 150 },
    ],
  },
];

// Tipos de comida
const MEAL_TYPES = {
  desayuno: { 
    label: '☀️ Desayuno', 
    emoji: '☀️',
    calPercent: 0.25,
    proteinPercent: 0.20,
    fatPercent: 0.30,
    carbsPercent: 0.25
  },
  media_manana: { 
    label: '🍎 M.mañana', 
    emoji: '🍎',
    calPercent: 0.10,
    proteinPercent: 0.15,
    fatPercent: 0.10,
    carbsPercent: 0.10
  },
  comida: { 
    label: '🍽️ Comida', 
    emoji: '🍽️',
    calPercent: 0.35,
    proteinPercent: 0.35,
    fatPercent: 0.30,
    carbsPercent: 0.40
  },
  merienda: { 
    label: '🥜 Merienda', 
    emoji: '🥜',
    calPercent: 0.10,
    proteinPercent: 0.10,
    fatPercent: 0.10,
    carbsPercent: 0.10
  },
  cena: { 
    label: '🌙 Cena', 
    emoji: '🌙',
    calPercent: 0.20,
    proteinPercent: 0.20,
    fatPercent: 0.20,
    carbsPercent: 0.15
  },
};

type MealType = keyof typeof MEAL_TYPES;

// Categorías de alimentos
const CATEGORIES = [
  { key: 'carnes', icon: '🥩', label: 'Carnes' },
  { key: 'pescados', icon: '🐟', label: 'Pescados' },
  { key: 'lacteos', icon: '🥛', label: 'Lácteos' },
  { key: 'cereales', icon: '🌾', label: 'Cereales' },
  { key: 'legumbres', icon: '🫘', label: 'Legumbres' },
  { key: 'verduras', icon: '🥬', label: 'Verduras' },
  { key: 'frutas', icon: '🍎', label: 'Frutas' },
  { key: 'frutosSecos', icon: '🥜', label: 'Frutos secos' },
  { key: 'preparados', icon: '🍕', label: 'Otros' },
];

interface PendingMeal {
  food: Food;
  quantity: number;
  calculated: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface Recommendation {
  type: 'success' | 'warning' | 'info' | 'error';
  icon: string;
  message: string;
}

export default function NutritionScreen() {
  // Hooks
  const { meals, mealsByType, dailyTotals, loading: mealsLoading, addMultipleMeals, deleteMeal } = useMeals();
  const { foods, loading: foodsLoading, searchFoods, getFoodsByCategory, calculateNutrition } = useFoods();
  const { profile: userData } = useUserData();

  // Estados locales - DECLARAR PRIMERO
  const [selectedMealType, setSelectedMealType] = useState<MealType>('desayuno');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodQuantity, setFoodQuantity] = useState<number>(100);
  const [pendingMeals, setPendingMeals] = useState<PendingMeal[]>([]);
  const [showCompleteBreakfasts, setShowCompleteBreakfasts] = useState(false);

  const targets = useMemo(() => {
    if (!userData) {
      return { calories: 1800, protein: 168, carbs: 180, fat: 50 };
    }
    
    const age = calculateAge(userData.birth_date);
    const height = userData.height_cm;
    const currentWeight = userData.current_weight;
    const targetWeight = userData.target_weight;
    const activityLevel = userData.activity_level;
    
    const bmr = Math.round(10 * currentWeight + 6.25 * height - 5 * age + 5);
    const activityFactors: { [key: string]: number } = { 
      sedentary: 1.2, 
      light: 1.375, 
      moderate: 1.55, 
      active: 1.725 
    };
    const tdee = Math.round(bmr * (activityFactors[activityLevel] || 1.55));
    const deficit = 600;
    const calories = tdee - deficit;
    const protein = Math.round(targetWeight * 2);
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    
    return { calories, protein, carbs, fat };
  }, [userData]);

  // Targets por comida
  const mealTargets = useMemo(() => {
    const mealConfig = MEAL_TYPES[selectedMealType];
    return {
      calories: Math.round(targets.calories * mealConfig.calPercent),
      protein: Math.round(targets.protein * mealConfig.proteinPercent),
      carbs: Math.round(targets.carbs * mealConfig.carbsPercent),
      fat: Math.round(targets.fat * mealConfig.fatPercent),
    };
  }, [targets, selectedMealType]);

  // Búsqueda y cálculos
  const searchResults = useMemo(() => searchFoods(searchTerm), [searchTerm, foods]);
  const categoryFoods = useMemo(() => {
    if (!selectedCategory) return [];
    return getFoodsByCategory(selectedCategory);
  }, [selectedCategory, foods]);

  const pendingTotals = useMemo(() => {
    return pendingMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calculated.calories,
        protein: acc.protein + meal.calculated.protein,
        carbs: acc.carbs + meal.calculated.carbs,
        fat: acc.fat + meal.calculated.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [pendingMeals]);

  // Totales actuales de esta comida
  const currentMealTotals = useMemo(() => {
    const currentMeals = mealsByType[selectedMealType];
    return currentMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [mealsByType, selectedMealType]);

  // Totales proyectados (actual + pendiente)
  const projectedTotals = useMemo(() => ({
    calories: currentMealTotals.calories + pendingTotals.calories,
    protein: currentMealTotals.protein + pendingTotals.protein,
    carbs: currentMealTotals.carbs + pendingTotals.carbs,
    fat: currentMealTotals.fat + pendingTotals.fat,
  }), [currentMealTotals, pendingTotals]);

  const remainingCalories = targets.calories - dailyTotals.calories;

  // RECOMENDACIONES INTELIGENTES
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    // Si no hay comida pendiente ni registrada, dar recomendaciones iniciales
    if (pendingMeals.length === 0 && currentMealTotals.calories === 0) {
      if (selectedMealType === 'desayuno') {
        recs.push({
          type: 'info',
          icon: '💡',
          message: `Desayuno ideal: ${mealTargets.calories} kcal con ${mealTargets.protein}g proteína`
        });
        recs.push({
          type: 'info',
          icon: '🥑',
          message: `Incluye ${mealTargets.fat}g de grasas saludables (aguacate, frutos secos)`
        });
        recs.push({
          type: 'info',
          icon: '🥚',
          message: 'Recomendado: Huevos, yogur griego, avena, frutas'
        });
      } else if (selectedMealType === 'comida') {
        recs.push({
          type: 'info',
          icon: '💡',
          message: `Comida principal: ${mealTargets.calories} kcal con ${mealTargets.protein}g proteína`
        });
        recs.push({
          type: 'info',
          icon: '🥩',
          message: 'Base: Proteína magra (pollo, pescado, ternera)'
        });
        recs.push({
          type: 'info',
          icon: '🥬',
          message: 'Añade: Verduras + carbohidratos complejos (arroz, pasta integral)'
        });
      } else if (selectedMealType === 'cena') {
        recs.push({
          type: 'info',
          icon: '💡',
          message: `Cena ligera: ${mealTargets.calories} kcal con ${mealTargets.protein}g proteína`
        });
        recs.push({
          type: 'info',
          icon: '🐟',
          message: 'Ideal: Pescado o proteína magra con verduras'
        });
        recs.push({
          type: 'info',
          icon: '🌙',
          message: 'Evita: Carbohidratos pesados por la noche'
        });
      } else {
        recs.push({
          type: 'info',
          icon: '🍎',
          message: `Snack: ${mealTargets.calories} kcal con ${mealTargets.protein}g proteína`
        });
        recs.push({
          type: 'info',
          icon: '🥜',
          message: 'Opciones: Frutas, yogur, frutos secos (porción pequeña)'
        });
      }
      return recs;
    }

    // Análisis de calorías
    if (projectedTotals.calories > mealTargets.calories * 1.2) {
      recs.push({
        type: 'error',
        icon: '🚨',
        message: `Excedes ${Math.round(projectedTotals.calories - mealTargets.calories)} kcal para esta comida`
      });
    } else if (projectedTotals.calories > mealTargets.calories) {
      recs.push({
        type: 'warning',
        icon: '⚠️',
        message: `Ligero exceso: +${Math.round(projectedTotals.calories - mealTargets.calories)} kcal`
      });
    } else if (projectedTotals.calories >= mealTargets.calories * 0.8) {
      recs.push({
        type: 'success',
        icon: '✅',
        message: `Calorías perfectas: ${Math.round(projectedTotals.calories)}/${mealTargets.calories} kcal`
      });
    }

    // Análisis de proteína
    if (projectedTotals.protein >= mealTargets.protein) {
      recs.push({
        type: 'success',
        icon: '💪',
        message: `¡Proteína suficiente! ${Math.round(projectedTotals.protein)}g/${mealTargets.protein}g`
      });
    } else if (projectedTotals.protein < mealTargets.protein * 0.5) {
      recs.push({
        type: 'warning',
        icon: '🥩',
        message: `Falta proteína: añade ${Math.round(mealTargets.protein - projectedTotals.protein)}g más`
      });
    }

    // Análisis de grasas
    if (projectedTotals.fat >= mealTargets.fat * 0.8 && projectedTotals.fat <= mealTargets.fat * 1.2) {
      recs.push({
        type: 'success',
        icon: '🥑',
        message: `Grasas saludables OK: ${Math.round(projectedTotals.fat)}g`
      });
    } else if (projectedTotals.fat > mealTargets.fat * 1.5) {
      recs.push({
        type: 'warning',
        icon: '⚠️',
        message: `Exceso de grasa: ${Math.round(projectedTotals.fat)}g (máx ${mealTargets.fat}g)`
      });
    } else if (projectedTotals.fat < mealTargets.fat * 0.5 && selectedMealType === 'desayuno') {
      recs.push({
        type: 'info',
        icon: '🥜',
        message: 'Añade grasas saludables: aguacate, frutos secos, aceite oliva'
      });
    }

    // Análisis de carbohidratos
    if (projectedTotals.carbs < mealTargets.carbs * 0.3 && ['desayuno', 'comida'].includes(selectedMealType)) {
      recs.push({
        type: 'info',
        icon: '🌾',
        message: 'Considera añadir carbohidratos: avena, arroz integral, pan integral'
      });
    } else if (projectedTotals.carbs > mealTargets.carbs * 1.5) {
      recs.push({
        type: 'warning',
        icon: '⚠️',
        message: `Muchos carbohidratos: ${Math.round(projectedTotals.carbs)}g`
      });
    }

    // Detección de alimentos procesados
    const hasProcessed = pendingMeals.some(m => m.food.tags?.includes('procesado'));
    if (hasProcessed) {
      recs.push({
        type: 'warning',
        icon: '🍕',
        message: 'Incluye alimentos procesados - mejor elegir opciones naturales'
      });
    }

    // Detección de verduras
    const hasVeggies = pendingMeals.some(m => 
      m.food.category === 'verduras' || m.food.tags?.includes('verdura')
    );
    if (!hasVeggies && ['comida', 'cena'].includes(selectedMealType) && pendingMeals.length > 0) {
      recs.push({
        type: 'info',
        icon: '🥬',
        message: 'Añade verduras para más nutrientes y fibra'
      });
    }

    return recs;
  }, [pendingMeals, projectedTotals, mealTargets, selectedMealType, currentMealTotals]);

  // Funciones
  const cancelSelection = () => {
    setSelectedFood(null);
    setFoodQuantity(100);
  };

  const addToPending = () => {
    if (!selectedFood) return;
    const calculated = calculateNutrition(selectedFood, foodQuantity);
    setPendingMeals([...pendingMeals, { food: selectedFood, quantity: foodQuantity, calculated }]);
    cancelSelection();
    setSearchTerm('');
    setSelectedCategory(null);
  };

  const removeFromPending = (index: number) => {
    setPendingMeals(pendingMeals.filter((_, i) => i !== index));
  };

  const addCompleteBreakfast = (breakfast: typeof COMPLETE_BREAKFASTS[0]) => {
    const newPendingMeals: PendingMeal[] = [];
    
    breakfast.foods.forEach(item => {
      const food = foods.find(f => f.name === item.name);
      if (food) {
        const calculated = calculateNutrition(food, item.quantity);
        newPendingMeals.push({ food, quantity: item.quantity, calculated });
      }
    });
    
    if (newPendingMeals.length > 0) {
      setPendingMeals([...pendingMeals, ...newPendingMeals]);
      setShowCompleteBreakfasts(false);
      Alert.alert('✅ Desayuno añadido', `${breakfast.name} añadido a preparación`);
    } else {
      Alert.alert('⚠️ Error', 'No se encontraron todos los alimentos');
    }
  };

  const confirmMeal = async () => {
    if (pendingMeals.length === 0) {
      Alert.alert('Sin comida', 'Añade alimentos antes de confirmar');
      return;
    }

    console.log('🔄 Iniciando confirmMeal...');
    console.log('📋 Pending meals:', pendingMeals);
    console.log('🍽️ Meal type:', selectedMealType);

    try {
      const mealsToAdd = pendingMeals.map(meal => ({
        food_id: meal.food.id,
        meal_type: selectedMealType,
        quantity: meal.quantity,
        unit: meal.food.unit,
        calories: meal.calculated.calories,
        protein: meal.calculated.protein,
        carbs: meal.calculated.carbs,
        fat: meal.calculated.fat,
      }));

      console.log('💾 Guardando en BD...');
      console.log('📦 Meals to add:', mealsToAdd);
      
      await addMultipleMeals(mealsToAdd);
      
      console.log('✅ Guardado exitoso!');
      setPendingMeals([]);
      Alert.alert(
        '✅ ¡Comida registrada!', 
        `${MEAL_TYPES[selectedMealType].label} añadido correctamente`
      );
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Error', 'No se pudo registrar la comida. Revisa la consola.');
    }
  };

  const handleDeleteMeal = async (mealId: string, foodName: string) => {
    Alert.alert('Eliminar comida', `¿Eliminar ${foodName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMeal(mealId);
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  if (mealsLoading || foodsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!foods || foods.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ No hay alimentos</Text>
        <Text style={styles.errorText}>La base de datos está vacía.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con totales diarios */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Objetivo</Text>
            <Text style={styles.summaryValue}>{targets.calories}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Consumido</Text>
            <Text style={[styles.summaryValue, styles.orangeText]}>
              {Math.round(dailyTotals.calories)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Restante</Text>
            <Text style={[styles.summaryValue, remainingCalories >= 0 ? styles.greenText : styles.redText]}>
              {Math.round(remainingCalories)}
            </Text>
          </View>
        </View>
      </View>

      {/* Contenido scrolleable */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card de añadir comida */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>➕ Añadir comida</Text>
          
          {/* Selector de tipo de comida */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealTypesScroll}>
            {Object.entries(MEAL_TYPES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSelectedMealType(key as MealType);
                  setPendingMeals([]);
                  cancelSelection();
                  setShowCompleteBreakfasts(false);
                }}
                style={[styles.mealTypeButton, selectedMealType === key && styles.mealTypeButtonActive]}
              >
                <Text style={[styles.mealTypeText, selectedMealType === key && styles.mealTypeTextActive]}>
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Botón de desayunos completos */}
          {selectedMealType === 'desayuno' && currentMealTotals.calories === 0 && (
            <TouchableOpacity 
              onPress={() => setShowCompleteBreakfasts(!showCompleteBreakfasts)}
              style={styles.completeBreakfastButton}
            >
              <Text style={styles.completeBreakfastButtonText}>
                {showCompleteBreakfasts ? '🍽️ Buscar alimentos individuales' : '⚡ Ver desayunos completos'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Desayunos completos */}
          {showCompleteBreakfasts && selectedMealType === 'desayuno' && (
            <View style={styles.completeBreakfastsContainer}>
              {COMPLETE_BREAKFASTS.map(breakfast => (
                <TouchableOpacity 
                  key={breakfast.id}
                  onPress={() => addCompleteBreakfast(breakfast)}
                  style={styles.completeBreakfastCard}
                >
                  <Text style={styles.completeBreakfastIcon}>{breakfast.icon}</Text>
                  <View style={styles.completeBreakfastInfo}>
                    <Text style={styles.completeBreakfastName}>{breakfast.name}</Text>
                    <Text style={styles.completeBreakfastDesc}>{breakfast.description}</Text>
                    <Text style={styles.completeBreakfastItems}>
                      {breakfast.foods.map(f => f.name).join(' • ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recomendaciones inteligentes */}
          {!showCompleteBreakfasts && recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              {recommendations.map((rec, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.recommendationItem,
                    rec.type === 'success' && styles.recommendationSuccess,
                    rec.type === 'warning' && styles.recommendationWarning,
                    rec.type === 'error' && styles.recommendationError,
                    rec.type === 'info' && styles.recommendationInfo,
                  ]}
                >
                  <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                  <Text style={styles.recommendationText}>{rec.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Comidas pendientes */}
          {pendingMeals.length > 0 && (
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingTitle}>🍽️ En preparación:</Text>
              {pendingMeals.map((meal, index) => (
                <View key={index} style={styles.pendingItem}>
                  <View style={styles.pendingItemLeft}>
                    <Text style={styles.pendingItemText}>{meal.food.name}</Text>
                    <Text style={styles.pendingItemSubtext}>
                      {meal.quantity}{meal.food.unit} • P:{Math.round(meal.calculated.protein)}g C:{Math.round(meal.calculated.carbs)}g G:{Math.round(meal.calculated.fat)}g
                    </Text>
                  </View>
                  <View style={styles.pendingItemRight}>
                    <Text style={styles.pendingCalories}>{Math.round(meal.calculated.calories)} kcal</Text>
                    <TouchableOpacity onPress={() => removeFromPending(index)} style={styles.deleteIconButton}>
                      <Text style={styles.deleteIcon}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.pendingTotal}>
                <View>
                  <Text style={styles.pendingTotalLabel}>Total:</Text>
                  <Text style={styles.pendingTotalSubtext}>
                    P:{Math.round(pendingTotals.protein)}g C:{Math.round(pendingTotals.carbs)}g G:{Math.round(pendingTotals.fat)}g
                  </Text>
                </View>
                <Text style={styles.pendingTotalValue}>{Math.round(pendingTotals.calories)} kcal</Text>
              </View>
              <TouchableOpacity onPress={confirmMeal} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>✓ Confirmar {MEAL_TYPES[selectedMealType].emoji}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!showCompleteBreakfasts && (
            <>
              {/* Búsqueda */}
              <View style={styles.searchContainer}>
                <TextInput
                  value={searchTerm}
                  onChangeText={(text) => {
                    setSearchTerm(text);
                    setSelectedCategory(null);
                    cancelSelection();
                  }}
                  placeholder="🔍 Buscar alimento..."
                  placeholderTextColor="#9ca3af"
                  style={styles.searchInput}
                />
              </View>

              {/* Categorías */}
              {!searchTerm && !selectedFood && (
                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => {
                        setSelectedCategory(selectedCategory === cat.key ? null : cat.key);
                        cancelSelection();
                      }}
                      style={[styles.categoryButton, selectedCategory === cat.key && styles.categoryButtonActive]}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Lista de alimentos - ALTURA COMPLETA */}
              {selectedCategory && !searchTerm && !selectedFood && categoryFoods.length > 0 && (
                <ScrollView style={styles.foodsListFull} nestedScrollEnabled>
                  {categoryFoods.map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      onPress={() => {
                        setSelectedFood(food);
                        setFoodQuantity(100);
                      }}
                      style={styles.foodItem}
                    >
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodCalories}>{food.calories_per_100} kcal</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Resultados de búsqueda - ALTURA COMPLETA */}
              {searchTerm && !selectedFood && searchResults.length > 0 && (
                <ScrollView style={styles.foodsListFull} nestedScrollEnabled>
                  {searchResults.map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      onPress={() => {
                        setSelectedFood(food);
                        setFoodQuantity(100);
                        setSearchTerm('');
                      }}
                      style={styles.foodItem}
                    >
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodCalories}>{food.calories_per_100} kcal</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {searchTerm && !selectedFood && searchResults.length === 0 && (
                <Text style={styles.noResultsText}>No se encontraron alimentos</Text>
              )}

              {/* Alimento seleccionado */}
              {selectedFood && (
                <View style={styles.selectedFoodContainer}>
                  <View style={styles.selectedFoodHeader}>
                    <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                    <TouchableOpacity onPress={cancelSelection} style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.quantityRow}>
                    <TextInput
                      value={foodQuantity.toString()}
                      onChangeText={(text) => setFoodQuantity(parseInt(text) || 0)}
                      keyboardType="numeric"
                      style={styles.quantityInput}
                    />
                    <Text style={styles.unitText}>{selectedFood.unit}</Text>
                    <View style={styles.caloriesDisplayContainer}>
                      <Text style={styles.caloriesDisplay}>
                        {calculateNutrition(selectedFood, foodQuantity).calories}
                      </Text>
                      <Text style={styles.caloriesLabel}>kcal</Text>
                    </View>
                  </View>
                  <View style={styles.quickQuantityRow}>
                    {[50, 100, 150, 200].map((qty) => (
                      <TouchableOpacity
                        key={qty}
                        onPress={() => setFoodQuantity(qty)}
                        style={[styles.quickQuantityButton, foodQuantity === qty && styles.quickQuantityButtonActive]}
                      >
                        <Text style={[styles.quickQuantityText, foodQuantity === qty && styles.quickQuantityTextActive]}>
                          {qty}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={addToPending} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Añadir a comida</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Comidas registradas hoy */}
        {meals.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>✅ Registrado hoy</Text>
            {Object.entries(MEAL_TYPES).map(([type, value]) => {
              const typeMeals = mealsByType[type as MealType];
              if (typeMeals.length === 0) return null;
              const typeTotal = typeMeals.reduce((sum, m) => sum + m.calories, 0);
              return (
                <View key={type} style={styles.mealTypeSection}>
                  <Text style={styles.mealTypeSectionLabel}>
                    {value.label} ({Math.round(typeTotal)} kcal)
                  </Text>
                  {typeMeals.map((meal) => {
                    // Obtener el nombre del alimento desde el food_id
                    const foodName = foods.find(f => f.id === meal.food_id)?.name || 'Alimento';
                    return (
                      <View key={meal.id} style={styles.registeredMealItem}>
                        <View style={styles.registeredMealLeft}>
                          <Text style={styles.registeredMealName}>{foodName}</Text>
                          <Text style={styles.registeredMealDetails}>
                            {meal.quantity}{meal.unit} • P:{Math.round(meal.protein)}g
                          </Text>
                        </View>
                        <View style={styles.registeredMealRight}>
                          <Text style={styles.registeredMealCalories}>{Math.round(meal.calories)} kcal</Text>
                          <TouchableOpacity onPress={() => handleDeleteMeal(meal.id, foodName)}>
                            <Text style={styles.deleteIcon}>×</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 12,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  orangeText: {
    color: '#f97316',
  },
  greenText: {
    color: '#22c55e',
  },
  redText: {
    color: '#ef4444',
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  mealTypesScroll: {
    marginBottom: 12,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: '#6366f1',
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  mealTypeTextActive: {
    color: '#ffffff',
  },
  completeBreakfastButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  completeBreakfastButtonText: {
    textAlign: 'center',
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completeBreakfastsContainer: {
    marginBottom: 16,
  },
  completeBreakfastCard: {
    flexDirection: 'row',
    backgroundColor: '#fefce8',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  completeBreakfastIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  completeBreakfastInfo: {
    flex: 1,
  },
  completeBreakfastName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 4,
  },
  completeBreakfastDesc: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
  completeBreakfastItems: {
    fontSize: 11,
    color: '#a16207',
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationSuccess: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  recommendationWarning: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  recommendationError: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  recommendationInfo: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  recommendationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  pendingContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginBottom: 16,
  },
  pendingTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#3730a3',
    marginBottom: 8,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d2fe',
  },
  pendingItemLeft: {
    flex: 1,
  },
  pendingItemText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  pendingItemSubtext: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  pendingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingCalories: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteIconButton: {
    padding: 4,
  },
  deleteIcon: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pendingTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#c7d2fe',
    marginTop: 8,
    paddingTop: 8,
  },
  pendingTotalLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#111827',
  },
  pendingTotalSubtext: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  pendingTotalValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#f97316',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: 15,
    color: '#111827',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryButton: {
    width: (width - 56) / 3,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  foodsListFull: {
    maxHeight: height * 0.5, // 50% de altura de pantalla
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  foodName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  foodCalories: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 14,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    paddingVertical: 16,
  },
  selectedFoodContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedFoodName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  quantityInput: {
    width: 80,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  unitText: {
    fontSize: 14,
    color: '#6b7280',
  },
  caloriesDisplayContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  caloriesDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f97316',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickQuantityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickQuantityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  quickQuantityButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  quickQuantityText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  quickQuantityTextActive: {
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  mealTypeSection: {
    marginBottom: 16,
  },
  mealTypeSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  registeredMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  registeredMealLeft: {
    flex: 1,
  },
  registeredMealName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  registeredMealDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  registeredMealRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  registeredMealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});