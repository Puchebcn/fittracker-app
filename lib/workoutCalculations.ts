// lib/workoutCalculations.ts
// Cálculos personalizados de calorías quemadas en entrenamientos

/**
 * Valores MET (Metabolic Equivalent of Task)
 * Fuente: Compendium of Physical Activities (Ainsworth et al.)
 * 
 * 1 MET = consumo energético en reposo
 * Valores más altos = mayor intensidad
 */

export const MET_VALUES = {
  // Entrenamiento de fuerza
  strength: {
    low: 3.5,      // Pesas ligeras, ejercicios suaves
    medium: 5.0,   // Entrenamiento moderado
    high: 6.0,     // Entrenamiento intenso
  },
  
  // Cardio general
  cardio: {
    low: 5.0,      // Cardio suave
    medium: 7.0,   // Cardio moderado
    high: 9.0,     // Cardio intenso
  },
  
  // HIIT
  hiit: {
    low: 8.0,      // HIIT suave
    medium: 10.0,  // HIIT moderado
    high: 12.0,    // HIIT intenso
  },
  
  // Actividades específicas de cardio
  walking: 3.5,           // Caminar 5 km/h
  walkingWithBaby: 3.0,   // Caminar con bebé en carrito
  running: 9.0,           // Correr 8 km/h
  cycling: 7.5,           // Bici intensidad moderada
  
  // Plan predefinido (entrenamiento de fuerza estructurado)
  predefined: {
    push: 5.0,      // Día empuje (pecho, hombros, tríceps)
    pull: 5.0,      // Día tirón (espalda, bíceps)
    legs: 6.0,      // Día pierna (más demandante)
    fullBody: 5.5,  // Full body (intensidad media-alta)
  },
};

/**
 * Valores EPOC (Excess Post-Exercise Oxygen Consumption)
 * 
 * El EPOC es el "afterburn effect" - calorías que sigues quemando
 * DESPUÉS del ejercicio durante la recuperación (hasta 48h)
 * 
 * Porcentajes basados en estudios científicos:
 * - Fuerza intensa: 15-20% EPOC (24-48h)
 * - HIIT: 20-25% EPOC (24-48h)
 * - Cardio moderado: 5-8% EPOC (1-3h)
 */
export const EPOC_MULTIPLIERS = {
  // Entrenamiento de fuerza (mayor EPOC por reparación muscular)
  strength: {
    low: 1.10,      // +10% EPOC
    medium: 1.15,   // +15% EPOC
    high: 1.20,     // +20% EPOC
  },
  
  // Cardio steady state (menor EPOC, recuperación rápida)
  cardio: {
    low: 1.05,      // +5% EPOC
    medium: 1.08,   // +8% EPOC
    high: 1.10,     // +10% EPOC
  },
  
  // HIIT (máximo EPOC por intensidad extrema)
  hiit: {
    low: 1.15,      // +15% EPOC
    medium: 1.20,   // +20% EPOC
    high: 1.25,     // +25% EPOC
  },
  
  // Plan predefinido (entrenamiento de fuerza estructurado)
  predefined: {
    push: 1.15,     // +15% EPOC (empuje moderado)
    pull: 1.15,     // +15% EPOC (tirón moderado)
    legs: 1.20,     // +20% EPOC (pierna más demandante)
    fullBody: 1.18, // +18% EPOC (full body intenso)
  },
  
  // Cardio específico
  walking: 1.05,           // +5% EPOC (bajo impacto)
  walkingWithBaby: 1.03,   // +3% EPOC (muy bajo impacto)
  running: 1.08,           // +8% EPOC (moderado)
  cycling: 1.06,           // +6% EPOC (moderado-bajo)
};

/**
 * Calcula calorías quemadas usando la fórmula MET + EPOC
 * 
 * NUEVA VERSION: Incluye el "afterburn effect"
 * 
 * @param met - Valor MET de la actividad
 * @param weightKg - Peso del usuario en kg
 * @param durationMin - Duración en minutos
 * @param epocMultiplier - Multiplicador EPOC (ej: 1.15 = +15%)
 * @returns Calorías totales (durante + después del ejercicio)
 */
export const calculateCaloriesBurned = (
  met: number,
  weightKg: number,
  durationMin: number,
  epocMultiplier: number = 1.0
): number => {
  // Calorías durante el ejercicio
  const caloriesPerMinute = (met * weightKg * 3.5) / 200;
  const caloriesDuring = caloriesPerMinute * durationMin;
  
  // Calorías totales (durante + EPOC)
  const totalCalories = caloriesDuring * epocMultiplier;
  
  return Math.round(totalCalories);
};

/**
 * Obtiene el multiplicador EPOC y calorías desglosadas
 * Útil para mostrar en la UI
 */
export const getCaloriesBreakdown = (
  calories: number,
  epocMultiplier: number
): { during: number; epoc: number; total: number; epocPercent: number } => {
  const during = Math.round(calories / epocMultiplier);
  const epoc = calories - during;
  const epocPercent = Math.round((epocMultiplier - 1) * 100);
  
  return { during, epoc, total: calories, epocPercent };
};

/**
 * Calcula calorías para workout predefinido del plan de 4 días
 * INCLUYE EPOC (afterburn effect)
 */
export const calculatePredefinedWorkoutCalories = (
  workoutId: number,
  weightKg: number,
  durationMin: number = 40
): number => {
  let met: number;
  let epocMultiplier: number;
  
  switch (workoutId) {
    case 1: // Día 1: Empuje
      met = MET_VALUES.predefined.push;
      epocMultiplier = EPOC_MULTIPLIERS.predefined.push;
      break;
    case 2: // Día 2: Tirón
      met = MET_VALUES.predefined.pull;
      epocMultiplier = EPOC_MULTIPLIERS.predefined.pull;
      break;
    case 3: // Día 3: Pierna
      met = MET_VALUES.predefined.legs;
      epocMultiplier = EPOC_MULTIPLIERS.predefined.legs;
      break;
    case 4: // Día 4: Full Body
      met = MET_VALUES.predefined.fullBody;
      epocMultiplier = EPOC_MULTIPLIERS.predefined.fullBody;
      break;
    default:
      met = MET_VALUES.predefined.fullBody;
      epocMultiplier = EPOC_MULTIPLIERS.predefined.fullBody;
  }
  
  return calculateCaloriesBurned(met, weightKg, durationMin, epocMultiplier);
};

/**
 * Calcula calorías para workout personalizado
 * INCLUYE EPOC según tipo e intensidad
 */
export const calculateCustomWorkoutCalories = (
  workoutType: 'strength' | 'cardio' | 'hiit',
  intensity: 'low' | 'medium' | 'high',
  weightKg: number,
  durationMin: number
): number => {
  const met = MET_VALUES[workoutType][intensity];
  const epocMultiplier = EPOC_MULTIPLIERS[workoutType][intensity];
  
  return calculateCaloriesBurned(met, weightKg, durationMin, epocMultiplier);
};

/**
 * Calcula calorías para cardio específico
 * INCLUYE EPOC según tipo de cardio
 */
export const calculateCardioCalories = (
  cardioType: 'walk' | 'walkVega' | 'run' | 'bike',
  weightKg: number,
  durationMin: number
): number => {
  let met: number;
  let epocMultiplier: number;
  
  switch (cardioType) {
    case 'walk':
      met = MET_VALUES.walking;
      epocMultiplier = EPOC_MULTIPLIERS.walking;
      break;
    case 'walkVega':
      met = MET_VALUES.walkingWithBaby;
      epocMultiplier = EPOC_MULTIPLIERS.walkingWithBaby;
      break;
    case 'run':
      met = MET_VALUES.running;
      epocMultiplier = EPOC_MULTIPLIERS.running;
      break;
    case 'bike':
      met = MET_VALUES.cycling;
      epocMultiplier = EPOC_MULTIPLIERS.cycling;
      break;
    default:
      met = MET_VALUES.walking;
      epocMultiplier = EPOC_MULTIPLIERS.walking;
  }
  
  return calculateCaloriesBurned(met, weightKg, durationMin, epocMultiplier);
};

/**
 * Calcula pasos estimados para cardio
 * (esto NO depende del peso, solo de la actividad y duración)
 */
export const calculateStepsAdded = (
  cardioType: 'walk' | 'walkVega' | 'run' | 'bike',
  durationMin: number
): number => {
  const stepsPerMinute: { [key: string]: number } = {
    walk: 100,      // Caminar: ~100 pasos/min
    walkVega: 90,   // Con bebé: más lento
    run: 160,       // Correr: ~160 pasos/min
    bike: 0,        // Bici: no cuenta pasos
  };
  
  return Math.round(stepsPerMinute[cardioType] * durationMin);
};

/**
 * Ejemplos de uso con el peso actual de Javi (102.4 kg):
 * 
 * IMPORTANTE: Ahora incluye EPOC (afterburn effect)
 * 
 * Día 1 Empuje (40min, MET 5.0, EPOC +15%):
 * Durante: 358 kcal
 * EPOC: +54 kcal (próximas 24-48h)
 * TOTAL: 412 kcal
 * 
 * Caminar 30min (MET 3.5, EPOC +5%):
 * Durante: 182 kcal
 * EPOC: +9 kcal (próximas 1-3h)
 * TOTAL: 191 kcal
 * 
 * Día 3 Pierna (40min, MET 6.0, EPOC +20%):
 * Durante: 429 kcal
 * EPOC: +86 kcal (próximas 24-48h)
 * TOTAL: 515 kcal
 * 
 * HIIT Alta 30min (MET 12.0, EPOC +25%):
 * Durante: 644 kcal
 * EPOC: +161 kcal (próximas 24-48h)
 * TOTAL: 805 kcal
 * 
 * Cuando pierda peso (ej: 95 kg):
 * Día 1 Empuje (40min):
 * TOTAL: 383 kcal (se ajusta automáticamente)
 */