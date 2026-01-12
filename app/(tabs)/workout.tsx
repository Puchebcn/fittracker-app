import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useUserData } from '../../hooks/useUserData';
import { supabase } from '../../lib/supabase';
import {
  calculatePredefinedWorkoutCalories,
  calculateCustomWorkoutCalories,
  calculateCardioCalories,
  calculateStepsAdded,
  getCaloriesBreakdown,
  EPOC_MULTIPLIERS,
} from '../../lib/workoutCalculations';

// ============================================================================
// TIPOS
// ============================================================================

type WorkoutMode = 'plan' | 'custom' | 'cardio';

type Intensity = 'low' | 'medium' | 'high';

interface PredefinedWorkout {
  id: number;
  name: string;
  muscles: string;
  duration: number;
  calories: number;
  icon: string;
}

interface CardioType {
  id: string;
  name: string;
  calPerMin: number;
  stepsPerMin: number;
  icon: string;
}

interface WorkoutType {
  id: string;
  name: string;
  icon: string;
  calPerMin: {
    low: number;
    medium: number;
    high: number;
  };
}

interface CustomWorkoutState {
  type: string;
  duration: number;
  intensity: Intensity;
}

interface SelectedCardio {
  type: string;
  duration: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

// Plan de 4 días predefinido
// NOTA: Las calorías ahora se calculan dinámicamente basadas en el peso del usuario
const PREDEFINED_WORKOUTS: PredefinedWorkout[] = [
  {
    id: 1,
    name: 'Día 1: Empuje',
    muscles: 'Pecho, Hombros, Tríceps',
    duration: 40,
    calories: 0, // Se calculará dinámicamente
    icon: '🏋️',
  },
  {
    id: 2,
    name: 'Día 2: Tirón',
    muscles: 'Espalda, Bíceps',
    duration: 40,
    calories: 0, // Se calculará dinámicamente
    icon: '💪',
  },
  {
    id: 3,
    name: 'Día 3: Pierna',
    muscles: 'Glúteos, Isquios, Core',
    duration: 40,
    calories: 0, // Se calculará dinámicamente
    icon: '🦵',
  },
  {
    id: 4,
    name: 'Día 4: Full Body',
    muscles: 'Todo el cuerpo',
    duration: 40,
    calories: 0, // Se calculará dinámicamente
    icon: '⚡',
  },
];

// Tipos de cardio (cálculos ahora son dinámicos basados en peso)
const CARDIO_TYPES = [
  { id: 'walk' as const, name: 'Caminar', icon: '🚶' },
  { id: 'walkVega' as const, name: 'Paseo Vega', icon: '👶' },
  { id: 'run' as const, name: 'Correr', icon: '🏃' },
  { id: 'bike' as const, name: 'Bici', icon: '🚴' },
];

// Tipos de entrenamiento custom (cálculos ahora son dinámicos basados en peso)
const WORKOUT_TYPES = [
  { id: 'strength' as const, name: 'Fuerza', icon: '🏋️' },
  { id: 'cardio' as const, name: 'Cardio', icon: '🏃' },
  { id: 'hiit' as const, name: 'HIIT', icon: '⚡' },
];

// Duraciones fijas para cardio
const CARDIO_DURATIONS = [15, 20, 30, 45, 60];

// Duraciones fijas para custom
const CUSTOM_DURATIONS = [20, 30, 40, 50, 60];

// Intensidades
const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: 'low', label: 'Baja' },
  { id: 'medium', label: 'Media' },
  { id: 'high', label: 'Alta' },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function WorkoutScreen() {
  // Estados
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>('plan');
  const [customWorkout, setCustomWorkout] = useState<CustomWorkoutState>({
    type: 'strength',
    duration: 40,
    intensity: 'medium',
  });
  const [selectedCardio, setSelectedCardio] = useState<SelectedCardio>({
    type: 'walk',
    duration: 30,
  });

  // Hook de datos del usuario (versión mejorada)
  const { userData, todayStats, targets, refresh, loading } = useUserData();

  // ============================================================================
  // CÁLCULOS (ANTES del return condicional - regla de hooks)
  // ============================================================================

  // Cálculo del total de calorías quemadas hoy
  const totalWorkoutCalories = useMemo(() => {
    if (!todayStats?.workouts) return 0;
    return todayStats.workouts.reduce(
      (sum, workout) => sum + workout.calories_burned,
      0
    );
  }, [todayStats?.workouts]);

  // Bonus ya viene calculado del hook
  const workoutBonus = targets?.workoutBonus || 0;

  // Cálculos para preview de custom workout (personalizado por peso)
  const customWorkoutCalories = useMemo(() => {
    if (!userData) return 0;
    return calculateCustomWorkoutCalories(
      customWorkout.type as 'strength' | 'cardio' | 'hiit',
      customWorkout.intensity as 'low' | 'medium' | 'high',
      userData.current_weight,
      customWorkout.duration
    );
  }, [customWorkout, userData]);

  // Cálculos para preview de cardio (personalizado por peso)
  const cardioCalories = useMemo(() => {
    if (!userData) return 0;
    return calculateCardioCalories(
      selectedCardio.type as 'walk' | 'walkVega' | 'run' | 'bike',
      userData.current_weight,
      selectedCardio.duration
    );
  }, [selectedCardio, userData]);

  const cardioSteps = useMemo(() => {
    return calculateStepsAdded(
      selectedCardio.type as 'walk' | 'walkVega' | 'run' | 'bike',
      selectedCardio.duration
    );
  }, [selectedCardio]);

  // Calcular calorías para mostrar en las cards del plan (personalizado por peso)
  const predefinedWorkoutsWithCalories = useMemo(() => {
    if (!userData) return PREDEFINED_WORKOUTS;
    
    return PREDEFINED_WORKOUTS.map(workout => ({
      ...workout,
      calories: calculatePredefinedWorkoutCalories(
        workout.id,
        userData.current_weight,
        workout.duration
      ),
    }));
  }, [userData]);

  // ============================================================================
  // SUGERENCIA INTELIGENTE - "HOY TOCA"
  // ============================================================================
  
  /**
   * Sugiere el siguiente workout del plan de 4 días basándose en el último entreno
   */
  const suggestedWorkout = useMemo(() => {
    if (!todayStats?.workouts || todayStats.workouts.length === 0) {
      return {
        workout: PREDEFINED_WORKOUTS[0],
        message: '¡Empieza con el Día 1!',
      };
    }

    // Buscar último workout del plan (predefined)
    const lastPredefined = [...todayStats.workouts]
      .reverse()
      .find(w => 
        w.name.includes('Empuje') || 
        w.name.includes('Tirón') || 
        w.name.includes('Pierna') || 
        w.name.includes('Full Body')
      );

    if (!lastPredefined) {
      return {
        workout: PREDEFINED_WORKOUTS[0],
        message: '¡Empieza con el Día 1!',
      };
    }

    // Determinar siguiente día según el último
    let nextWorkout: PredefinedWorkout;
    let message: string;

    if (lastPredefined.name.includes('Empuje')) {
      nextWorkout = PREDEFINED_WORKOUTS[1]; // Día 2: Tirón
      message = 'Después de Empuje, toca Tirón';
    } else if (lastPredefined.name.includes('Tirón')) {
      nextWorkout = PREDEFINED_WORKOUTS[2]; // Día 3: Pierna
      message = 'Después de Tirón, toca Pierna';
    } else if (lastPredefined.name.includes('Pierna')) {
      nextWorkout = PREDEFINED_WORKOUTS[3]; // Día 4: Full Body
      message = 'Después de Pierna, toca Full Body';
    } else {
      nextWorkout = PREDEFINED_WORKOUTS[0]; // Día 1: Empuje
      message = 'Después de Full Body, vuelve a Empuje';
    }

    return { workout: nextWorkout, message };
  }, [todayStats]);

  // ============================================================================
  // CALENDARIO SEMANAL
  // ============================================================================
  
  /**
   * Obtiene los workouts de los últimos 7 días con iconos
   */
  const weeklyCalendar = useMemo(() => {
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const today = new Date();
    const calendar = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      
      // Por ahora, solo marcamos el día actual si hay workouts
      // En una implementación completa, consultarías el historial de cada día
      const isToday = i === 0;
      const hasWorkout = isToday && todayStats.workouts.length > 0;
      
      calendar.push({
        day: dayName,
        hasWorkout,
        isToday,
        icon: hasWorkout ? '✅' : isToday ? '?' : '-',
      });
    }

    return calendar;
  }, [todayStats]);

  // Total de workouts de la semana (simplificado - solo hoy por ahora)
  const weeklyTotal = useMemo(() => {
    const todayCalories = todayStats.workouts.reduce(
      (sum, w) => sum + w.calories_burned,
      0
    );
    
    return {
      calories: todayCalories,
      count: todayStats.workouts.length,
    };
  }, [todayStats]);

  // ============================================================================
  // VALIDACIÓN (DESPUÉS de todos los hooks)
  // ============================================================================
  
  if (!userData || !targets || !todayStats) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 12, color: '#6b7280' }}>Cargando entrenamientos...</Text>
      </View>
    );
  }

  // ============================================================================
  // FUNCIONES DE REGISTRO
  // ============================================================================

  /**
   * Registrar workout predefinido (con cálculo personalizado de calorías)
   */
  const handleAddPredefinedWorkout = async (workout: PredefinedWorkout) => {
    try {
      // Calcular calorías basadas en el peso del usuario
      const calories = calculatePredefinedWorkoutCalories(
        workout.id,
        userData.current_weight,
        workout.duration
      );

      const { error } = await supabase.from('workouts').insert({
        user_id: userData?.id,
        workout_type: 'predefined',
        name: workout.name,
        duration_min: workout.duration,
        calories_burned: calories,  // Calorías personalizadas
        steps_added: 0,
      });

      if (error) throw error;

      // Calcular comparación antes/después
      const oldTarget = targets.calories;
      const bonus = Math.round(calories * 0.5);
      const newTarget = oldTarget + bonus;

      // Obtener desglose EPOC para mostrar
      const epocMultiplier = 
        workout.id === 1 ? EPOC_MULTIPLIERS.predefined.push :
        workout.id === 2 ? EPOC_MULTIPLIERS.predefined.pull :
        workout.id === 3 ? EPOC_MULTIPLIERS.predefined.legs :
        EPOC_MULTIPLIERS.predefined.fullBody;
      
      const breakdown = getCaloriesBreakdown(calories, epocMultiplier);

      // Refrescar datos
      await refresh();
      
      // Alert con comparación y desglose EPOC
      Alert.alert(
        '🔥 ¡Entreno registrado!',
        `${workout.name}\n\n` +
        `💪 ${breakdown.during} kcal durante\n` +
        `🔥 +${breakdown.epoc} kcal EPOC (24-48h)\n` +
        `────────────────\n` +
        `Total: ${calories} kcal\n\n` +
        `🎯 Tu objetivo aumentó:\n` +
        `${oldTarget} → ${newTarget} kcal (+${bonus} kcal)\n\n` +
        `💡 El afterburn seguirá quemando\ncalorías las próximas 24-48h`
      );
    } catch (error) {
      console.error('Error registrando workout:', error);
      Alert.alert('Error', 'No se pudo registrar el entreno');
    }
  };

  /**
   * Registrar workout custom (con cálculo personalizado de calorías)
   */
  const handleAddCustomWorkout = async () => {
    const workoutType = WORKOUT_TYPES.find((w) => w.id === customWorkout.type);
    if (!workoutType) return;

    // Calcular calorías basadas en el peso del usuario
    const calories = calculateCustomWorkoutCalories(
      customWorkout.type as 'strength' | 'cardio' | 'hiit',
      customWorkout.intensity as 'low' | 'medium' | 'high',
      userData.current_weight,
      customWorkout.duration
    );

    try {
      const { error } = await supabase.from('workouts').insert({
        user_id: userData?.id,
        workout_type: 'custom',
        name: `${workoutType.name} ${customWorkout.intensity === 'low' ? 'baja' : customWorkout.intensity === 'medium' ? 'media' : 'alta'}`,
        duration_min: customWorkout.duration,
        calories_burned: calories,
        steps_added: 0,
      });

      if (error) throw error;

      // Calcular comparación antes/después
      const oldTarget = targets.calories;
      const bonus = Math.round(calories * 0.5);
      const newTarget = oldTarget + bonus;

      // Obtener desglose EPOC
      const epocMultiplier = EPOC_MULTIPLIERS[customWorkout.type as 'strength' | 'cardio' | 'hiit'][customWorkout.intensity as 'low' | 'medium' | 'high'];
      const breakdown = getCaloriesBreakdown(calories, epocMultiplier);

      await refresh();
      
      const intensityLabel = customWorkout.intensity === 'low' ? 'baja' : customWorkout.intensity === 'medium' ? 'media' : 'alta';
      
      Alert.alert(
        '🔥 ¡Entreno registrado!',
        `${workoutType.name} ${intensityLabel}\n\n` +
        `💪 ${breakdown.during} kcal durante\n` +
        `🔥 +${breakdown.epoc} kcal EPOC (${customWorkout.type === 'strength' || customWorkout.type === 'hiit' ? '24-48h' : '1-3h'})\n` +
        `────────────────\n` +
        `Total: ${calories} kcal\n\n` +
        `🎯 Tu objetivo aumentó:\n` +
        `${oldTarget} → ${newTarget} kcal (+${bonus} kcal)` +
        (customWorkout.type === 'strength' || customWorkout.type === 'hiit' ? '\n\n💡 El afterburn seguirá quemando\ncalorías las próximas 24-48h' : '')
      );
    } catch (error) {
      console.error('Error registrando workout:', error);
      Alert.alert('Error', 'No se pudo registrar el entreno');
    }
  };

  /**
   * Registrar cardio (con cálculo personalizado de calorías)
   */
  const handleAddCardio = async () => {
    try {
      // Calcular calorías y pasos basados en el peso del usuario
      const calories = calculateCardioCalories(
        selectedCardio.type as 'walk' | 'walkVega' | 'run' | 'bike',
        userData.current_weight,
        selectedCardio.duration
      );
      const steps = calculateStepsAdded(
        selectedCardio.type as 'walk' | 'walkVega' | 'run' | 'bike',
        selectedCardio.duration
      );

      // Registrar workout
      const { error: workoutError } = await supabase.from('workouts').insert({
        user_id: userData?.id,
        workout_type: 'cardio',
        name: CARDIO_TYPES.find((c) => c.id === selectedCardio.type)?.name || 'Cardio',
        duration_min: selectedCardio.duration,
        calories_burned: calories,
        steps_added: steps,
      });

      if (workoutError) throw workoutError;

      // Si hay pasos, actualizarlos en steps_log
      if (steps > 0) {
        const today = new Date().toISOString().split('T')[0];

        // Obtener pasos actuales del día
        const { data: existingSteps } = await supabase
          .from('steps_log')
          .select('*')
          .eq('user_id', userData?.id)
          .gte('logged_at', `${today}T00:00:00`)
          .lte('logged_at', `${today}T23:59:59`)
          .single();

        if (existingSteps) {
          // Actualizar pasos existentes
          await supabase
            .from('steps_log')
            .update({ steps: existingSteps.steps + steps })
            .eq('id', existingSteps.id);
        } else {
          // Crear nuevo registro de pasos
          await supabase.from('steps_log').insert({
            user_id: userData?.id,
            steps: steps,
          });
        }
      }

      // Calcular comparación antes/después
      const oldTarget = targets.calories;
      const bonus = Math.round(calories * 0.5);
      const newTarget = oldTarget + bonus;

      // Obtener desglose EPOC
      const cardioTypeKey = selectedCardio.type === 'walk' ? 'walking' :
                           selectedCardio.type === 'walkVega' ? 'walkingWithBaby' :
                           selectedCardio.type === 'run' ? 'running' : 'cycling';
      const epocMultiplier = EPOC_MULTIPLIERS[cardioTypeKey as 'walking' | 'walkingWithBaby' | 'running' | 'cycling'];
      const breakdown = getCaloriesBreakdown(calories, epocMultiplier);

      await refresh();
      
      Alert.alert(
        '🔥 ¡Cardio registrado!',
        `${CARDIO_TYPES.find((c) => c.id === selectedCardio.type)?.name}\n\n` +
        `💪 ${breakdown.during} kcal durante\n` +
        `🔥 +${breakdown.epoc} kcal EPOC (1-3h)\n` +
        (steps > 0 ? `🚶 +${steps} pasos\n` : '') +
        `────────────────\n` +
        `Total: ${calories} kcal\n\n` +
        `🎯 Tu objetivo aumentó:\n` +
        `${oldTarget} → ${newTarget} kcal (+${bonus} kcal)`
      );
    } catch (error) {
      console.error('Error registrando cardio:', error);
      Alert.alert('Error', 'No se pudo registrar el cardio');
    }
  };

  /**
   * Eliminar workout
   */
  const handleRemoveWorkout = async (workoutId: string) => {
    // En web, usar confirm nativo del navegador
    const confirmed = confirm('¿Estás seguro de que quieres eliminar este entreno?');
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;

      await refresh();
      Alert.alert('✅ Eliminado', 'Entreno eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando workout:', error);
      Alert.alert('Error', 'No se pudo eliminar el entreno');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      {/* HEADER - Resumen del día */}
      <View style={styles.header}>
        {todayStats.workouts.length > 0 ? (
          <>
            <Text style={styles.headerTitle}>💪 ¡Has entrenado hoy!</Text>
            <Text style={styles.headerCalories}>
              {totalWorkoutCalories} kcal quemadas
            </Text>
            <Text style={styles.headerWeight}>
              Basado en {userData.current_weight} kg
            </Text>
            <View style={styles.bonusTag}>
              <Text style={styles.bonusText}>
                +{workoutBonus} kcal extra al objetivo
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.headerTitle}>🔥 ¡Es momento de entrenar!</Text>
            <Text style={styles.headerSubtitle}>
              Añade un entreno para ganar calorías extra
            </Text>
          </>
        )}
      </View>

      {/* CALENDARIO SEMANAL */}
      <View style={styles.calendarSection}>
        <Text style={styles.calendarTitle}>📅 Esta semana</Text>
        <View style={styles.calendarRow}>
          {weeklyCalendar.map((day, index) => (
            <View
              key={index}
              style={[
                styles.calendarDay,
                day.isToday && styles.calendarDayToday,
              ]}
            >
              <Text style={styles.calendarDayName}>{day.day}</Text>
              <Text style={styles.calendarDayIcon}>{day.icon}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.calendarStats}>
          {weeklyTotal.count} entreno{weeklyTotal.count !== 1 ? 's' : ''} • {weeklyTotal.calories} kcal
        </Text>
      </View>

      {/* SUGERENCIA "HOY TOCA" */}
      {workoutMode === 'plan' && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionTitle}>💡 Sugerencia</Text>
          <TouchableOpacity
            style={styles.suggestionCard}
            onPress={() => handleAddPredefinedWorkout(suggestedWorkout.workout)}
          >
            <View style={styles.suggestionLeft}>
              <Text style={styles.suggestionIcon}>{suggestedWorkout.workout.icon}</Text>
              <View>
                <Text style={styles.suggestionName}>
                  {suggestedWorkout.workout.name}
                </Text>
                <Text style={styles.suggestionMessage}>
                  {suggestedWorkout.message}
                </Text>
              </View>
            </View>
            <View style={styles.suggestionRight}>
              <Text style={styles.suggestionCalories}>
                {predefinedWorkoutsWithCalories.find(w => w.id === suggestedWorkout.workout.id)?.calories} kcal
              </Text>
              <Text style={styles.suggestionAction}>Tap para añadir →</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ENTRENOS REGISTRADOS HOY */}
      {todayStats.workouts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Entrenos de hoy</Text>
          {todayStats.workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDetails}>
                  {workout.duration_min} min • {workout.calories_burned} kcal
                  {workout.steps_added > 0 && ` • +${workout.steps_added} pasos`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveWorkout(workout.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* AÑADIR ENTRENO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>➕ Añadir entreno</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, workoutMode === 'plan' && styles.tabActive]}
            onPress={() => setWorkoutMode('plan')}
          >
            <Text
              style={[
                styles.tabText,
                workoutMode === 'plan' && styles.tabTextActive,
              ]}
            >
              🏋️ Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, workoutMode === 'custom' && styles.tabActive]}
            onPress={() => setWorkoutMode('custom')}
          >
            <Text
              style={[
                styles.tabText,
                workoutMode === 'custom' && styles.tabTextActive,
              ]}
            >
              🎛️ Custom
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, workoutMode === 'cardio' && styles.tabActive]}
            onPress={() => setWorkoutMode('cardio')}
          >
            <Text
              style={[
                styles.tabText,
                workoutMode === 'cardio' && styles.tabTextActive,
              ]}
            >
              🚶 Cardio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según tab */}
        <View style={styles.tabContent}>
          {/* PLAN PREDEFINIDO */}
          {workoutMode === 'plan' && (
            <View style={styles.planContent}>
              {predefinedWorkoutsWithCalories.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.planCard}
                  onPress={() => handleAddPredefinedWorkout(workout)}
                >
                  <View style={styles.planCardLeft}>
                    <Text style={styles.planIcon}>{workout.icon}</Text>
                    <View>
                      <Text style={styles.planName}>{workout.name}</Text>
                      <Text style={styles.planMuscles}>{workout.muscles}</Text>
                    </View>
                  </View>
                  <View style={styles.planCardRight}>
                    <Text style={styles.planDuration}>{workout.duration}min</Text>
                    <Text style={styles.planCalories}>{workout.calories} kcal</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* CUSTOM WORKOUT */}
          {workoutMode === 'custom' && (
            <View style={styles.customContent}>
              {/* Tipo */}
              <Text style={styles.customLabel}>Tipo:</Text>
              <View style={styles.optionsGrid}>
                {WORKOUT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.optionCard,
                      customWorkout.type === type.id && styles.optionCardActive,
                    ]}
                    onPress={() =>
                      setCustomWorkout((prev) => ({ ...prev, type: type.id }))
                    }
                  >
                    <Text style={styles.optionIcon}>{type.icon}</Text>
                    <Text style={styles.optionName}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Duración */}
              <Text style={styles.customLabel}>
                Duración: {customWorkout.duration}min
              </Text>
              <View style={styles.durationButtons}>
                {CUSTOM_DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      customWorkout.duration === duration &&
                        styles.durationButtonActive,
                    ]}
                    onPress={() =>
                      setCustomWorkout((prev) => ({ ...prev, duration }))
                    }
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        customWorkout.duration === duration &&
                          styles.durationButtonTextActive,
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Intensidad */}
              <Text style={styles.customLabel}>Intensidad:</Text>
              <View style={styles.intensityButtons}>
                {INTENSITIES.map((intensity) => (
                  <TouchableOpacity
                    key={intensity.id}
                    style={[
                      styles.intensityButton,
                      customWorkout.intensity === intensity.id &&
                        styles.intensityButtonActive,
                    ]}
                    onPress={() =>
                      setCustomWorkout((prev) => ({
                        ...prev,
                        intensity: intensity.id,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.intensityButtonText,
                        customWorkout.intensity === intensity.id &&
                          styles.intensityButtonTextActive,
                      ]}
                    >
                      {intensity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Calorías estimadas:</Text>
                <Text style={styles.previewCalories}>
                  {customWorkoutCalories} kcal
                </Text>
              </View>

              {/* Registrar */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleAddCustomWorkout}
              >
                <Text style={styles.registerButtonText}>✓ Registrar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CARDIO */}
          {workoutMode === 'cardio' && (
            <View style={styles.cardioContent}>
              {/* Tipo de cardio */}
              <View style={styles.cardioGrid}>
                {CARDIO_TYPES.map((cardio) => (
                  <TouchableOpacity
                    key={cardio.id}
                    style={[
                      styles.cardioCard,
                      selectedCardio.type === cardio.id &&
                        styles.cardioCardActive,
                    ]}
                    onPress={() =>
                      setSelectedCardio((prev) => ({ ...prev, type: cardio.id }))
                    }
                  >
                    <Text style={styles.cardioIcon}>{cardio.icon}</Text>
                    <Text style={styles.cardioName}>{cardio.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Duración */}
              <Text style={styles.customLabel}>
                Duración: {selectedCardio.duration}min
              </Text>
              <View style={styles.durationButtons}>
                {CARDIO_DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      selectedCardio.duration === duration &&
                        styles.durationButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedCardio((prev) => ({ ...prev, duration }))
                    }
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        selectedCardio.duration === duration &&
                          styles.durationButtonTextActive,
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <View style={styles.previewCard}>
                <View style={styles.previewRow}>
                  <View style={styles.previewItem}>
                    <Text style={styles.previewValue}>{cardioCalories}</Text>
                    <Text style={styles.previewUnit}>kcal</Text>
                  </View>
                  {cardioSteps > 0 && (
                    <View style={styles.previewItem}>
                      <Text style={styles.previewValue}>+{cardioSteps}</Text>
                      <Text style={styles.previewUnit}>pasos</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Registrar */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleAddCardio}
              >
                <Text style={styles.registerButtonText}>✓ Registrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Espaciado inferior */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#10B981',
    padding: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
  },
  headerCalories: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerWeight: {
    fontSize: 12,
    color: '#D1FAE5',
    marginBottom: 12,
  },
  bonusTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bonusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Calendario semanal
  calendarSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: -8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarDay: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    minWidth: 40,
  },
  calendarDayToday: {
    backgroundColor: '#EEF2FF',
  },
  calendarDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  calendarDayIcon: {
    fontSize: 16,
  },
  calendarStats: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Sugerencia "Hoy toca"
  suggestionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  suggestionCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  suggestionIcon: {
    fontSize: 32,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  suggestionMessage: {
    fontSize: 12,
    color: '#B45309',
  },
  suggestionRight: {
    alignItems: 'flex-end',
  },
  suggestionCalories: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  suggestionAction: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  planContent: {
    gap: 8,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planIcon: {
    fontSize: 32,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  planMuscles: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  planCardRight: {
    alignItems: 'flex-end',
  },
  planDuration: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  planCalories: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 2,
  },
  customContent: {
    gap: 12,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionCardActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#7C3AED',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  intensityButtonActive: {
    backgroundColor: '#7C3AED',
  },
  intensityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  intensityButtonTextActive: {
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  previewCalories: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7C3AED',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  previewItem: {
    alignItems: 'center',
  },
  previewValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7C3AED',
  },
  previewUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  registerButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cardioContent: {
    gap: 12,
  },
  cardioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardioCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cardioCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  cardioIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardioName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});