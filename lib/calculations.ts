// lib/calculations.ts
// Funciones de cálculo para objetivos nutricionales y de fitness

/**
 * Calcula el Metabolismo Basal (BMR) usando la fórmula Mifflin-St Jeor
 * BMR = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) + 5 (hombres)
 */
export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  isMale: boolean = true
): number => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(base + (isMale ? 5 : -161));
};

/**
 * Calcula el Gasto Energético Total Diario (TDEE)
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
): number => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
};

/**
 * Calcula el objetivo calórico diario con déficit y bonus por entrenamiento
 */
export const calculateDailyCalorieTarget = (
  tdee: number,
  deficit: number = 600,
  workoutBonus: number = 0
): number => {
  return tdee - deficit + workoutBonus;
};

/**
 * Calcula el bonus de calorías por entrenamiento (50% de las calorías quemadas)
 */
export const calculateWorkoutBonus = (caloriesBurned: number): number => {
  return Math.round(caloriesBurned * 0.5);
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 */
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calcula los macronutrientes objetivo basados en el objetivo calórico
 * Proteína: 2g por kg de peso objetivo
 * Grasa: 25% de las calorías totales
 * Carbohidratos: resto de calorías
 */
export const calculateMacros = (
  targetCalories: number,
  targetWeightKg: number
): {
  protein: number;
  carbs: number;
  fat: number;
} => {
  // Proteína: 2g por kg de peso objetivo
  const protein = Math.round(targetWeightKg * 2);
  
  // Grasa: 25% de calorías totales / 9 calorías por gramo
  const fat = Math.round((targetCalories * 0.25) / 9);
  
  // Carbohidratos: calorías restantes / 4 calorías por gramo
  const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4);
  
  return { protein, carbs, fat };
};

/**
 * Calcula el progreso de pérdida de peso en porcentaje
 */
export const calculateWeightProgress = (
  startWeight: number,
  currentWeight: number,
  targetWeight: number
): number => {
  const totalToLose = startWeight - targetWeight;
  const lost = startWeight - currentWeight;
  return Math.min(Math.round((lost / totalToLose) * 100), 100);
};

/**
 * Calcula los objetivos de macros por tipo de comida
 */
export const calculateMealMacros = (
  dailyProtein: number,
  dailyCalories: number,
  mealType: 'desayuno' | 'media_manana' | 'comida' | 'merienda' | 'cena'
): {
  calories: number;
  protein: number;
} => {
  const distributions = {
    desayuno: { calories: 0.25, protein: 0.2 },
    media_manana: { calories: 0.1, protein: 0.1 },
    comida: { calories: 0.35, protein: 0.35 },
    merienda: { calories: 0.1, protein: 0.15 },
    cena: { calories: 0.2, protein: 0.2 },
  };

  const dist = distributions[mealType];
  
  return {
    calories: Math.round(dailyCalories * dist.calories),
    protein: Math.round(dailyProtein * dist.protein),
  };
};

/**
 * Formatea un número de calorías con separador de miles
 */
export const formatCalories = (calories: number): string => {
  return Math.round(calories).toLocaleString('es-ES');
};

/**
 * Formatea un peso con 1 decimal
 */
export const formatWeight = (weight: number): string => {
  return weight.toFixed(1);
};

/**
 * Calcula el porcentaje de un macro respecto a su objetivo
 */
export const calculateMacroPercentage = (
  current: number,
  target: number
): number => {
  return Math.min(Math.round((current / target) * 100), 100);
};