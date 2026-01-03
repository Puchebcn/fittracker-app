import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid, Tooltip } from 'recharts';

export default function FitnessApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodQty, setFoodQty] = useState(100);
  const [mealType, setMealType] = useState('desayuno');
  const [selectedCat, setSelectedCat] = useState(null);
  const [pendingMeal, setPendingMeal] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', cal: '', p: '', c: '', g: '' });
  const [workoutMode, setWorkoutMode] = useState('predefined');
  const [customWorkout, setCustomWorkout] = useState({ type: 'fuerza', duration: 40, intensity: 'media' });
  const [selectedCardio, setSelectedCardio] = useState({ type: 'caminar', duration: 30 });
  
  // NUEVOS ESTADOS
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedDayPlan, setSelectedDayPlan] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // BASE DE DATOS SIMPLIFICADA
  const foods = {
    carnes: [
      { id: 1, n: 'Pechuga de pollo', cal: 165, p: 31, c: 0, g: 4, u: 'g', tags: ['proteina', 'magro'] },
      { id: 2, n: 'Pavo pechuga', cal: 135, p: 30, c: 0, g: 1, u: 'g', tags: ['proteina', 'magro'] },
      { id: 3, n: 'Ternera magra', cal: 158, p: 28, c: 0, g: 5, u: 'g', tags: ['proteina'] },
      { id: 4, n: 'Jamón serrano', cal: 241, p: 31, c: 0, g: 13, u: 'g', tags: ['proteina'] },
      { id: 5, n: 'Jamón york', cal: 126, p: 21, c: 1, g: 4, u: 'g', tags: ['proteina', 'procesado'] },
    ],
    pescados: [
      { id: 20, n: 'Salmón', cal: 208, p: 20, c: 0, g: 13, u: 'g', tags: ['proteina', 'omega3'] },
      { id: 21, n: 'Atún fresco', cal: 144, p: 23, c: 0, g: 5, u: 'g', tags: ['proteina'] },
      { id: 22, n: 'Atún lata', cal: 116, p: 26, c: 0, g: 1, u: 'g', tags: ['proteina', 'magro'] },
      { id: 23, n: 'Merluza', cal: 89, p: 17, c: 0, g: 2, u: 'g', tags: ['proteina', 'magro'] },
      { id: 24, n: 'Gambas', cal: 106, p: 20, c: 1, g: 2, u: 'g', tags: ['proteina'] },
    ],
    lacteos: [
      { id: 50, n: 'Huevo entero', cal: 155, p: 13, c: 1, g: 11, u: 'g', tags: ['proteina'] },
      { id: 51, n: 'Clara de huevo', cal: 52, p: 11, c: 1, g: 0, u: 'g', tags: ['proteina', 'magro'] },
      { id: 52, n: 'Yogur griego 0%', cal: 59, p: 10, c: 4, g: 1, u: 'g', tags: ['proteina'] },
      { id: 53, n: 'Leche desnatada', cal: 35, p: 3, c: 5, g: 0, u: 'ml', tags: [] },
      { id: 54, n: 'Queso fresco', cal: 174, p: 15, c: 3, g: 12, u: 'g', tags: ['proteina'] },
      { id: 55, n: 'Requesón', cal: 96, p: 14, c: 4, g: 3, u: 'g', tags: ['proteina'] },
    ],
    cereales: [
      { id: 80, n: 'Arroz integral', cal: 123, p: 3, c: 26, g: 1, u: 'g', tags: ['carbComplejo'] },
      { id: 81, n: 'Arroz blanco', cal: 130, p: 3, c: 28, g: 0, u: 'g', tags: ['carbComplejo'] },
      { id: 82, n: 'Pasta integral', cal: 124, p: 5, c: 24, g: 1, u: 'g', tags: ['carbComplejo'] },
      { id: 83, n: 'Pan integral', cal: 247, p: 13, c: 41, g: 3, u: 'g', tags: ['carbComplejo'] },
      { id: 84, n: 'Avena', cal: 389, p: 17, c: 66, g: 7, u: 'g', tags: ['carbComplejo', 'fibra'] },
      { id: 85, n: 'Quinoa', cal: 120, p: 4, c: 21, g: 2, u: 'g', tags: ['carbComplejo'] },
    ],
    legumbres: [
      { id: 110, n: 'Garbanzos', cal: 164, p: 9, c: 27, g: 3, u: 'g', tags: ['proteina', 'fibra'] },
      { id: 111, n: 'Lentejas', cal: 116, p: 9, c: 20, g: 0, u: 'g', tags: ['proteina', 'fibra'] },
      { id: 112, n: 'Judías', cal: 139, p: 9, c: 25, g: 1, u: 'g', tags: ['proteina', 'fibra'] },
    ],
    verduras: [
      { id: 150, n: 'Tomate', cal: 18, p: 1, c: 4, g: 0, u: 'g', tags: ['verdura'] },
      { id: 151, n: 'Lechuga', cal: 15, p: 1, c: 3, g: 0, u: 'g', tags: ['verdura'] },
      { id: 152, n: 'Espinacas', cal: 23, p: 3, c: 4, g: 0, u: 'g', tags: ['verdura'] },
      { id: 153, n: 'Brócoli', cal: 34, p: 3, c: 7, g: 0, u: 'g', tags: ['verdura'] },
      { id: 154, n: 'Calabacín', cal: 17, p: 1, c: 3, g: 0, u: 'g', tags: ['verdura'] },
      { id: 155, n: 'Pimiento', cal: 31, p: 1, c: 6, g: 0, u: 'g', tags: ['verdura'] },
      { id: 156, n: 'Zanahoria', cal: 41, p: 1, c: 10, g: 0, u: 'g', tags: ['verdura'] },
      { id: 157, n: 'Champiñones', cal: 22, p: 3, c: 3, g: 0, u: 'g', tags: ['verdura'] },
    ],
    frutas: [
      { id: 200, n: 'Manzana', cal: 52, p: 0, c: 14, g: 0, u: 'g', tags: ['fruta'] },
      { id: 201, n: 'Plátano', cal: 89, p: 1, c: 23, g: 0, u: 'g', tags: ['fruta'] },
      { id: 202, n: 'Naranja', cal: 47, p: 1, c: 12, g: 0, u: 'g', tags: ['fruta'] },
      { id: 203, n: 'Fresas', cal: 32, p: 1, c: 8, g: 0, u: 'g', tags: ['fruta'] },
      { id: 204, n: 'Aguacate', cal: 160, p: 2, c: 9, g: 15, u: 'g', tags: ['grasaSaludable'] },
    ],
    frutosSecos: [
      { id: 250, n: 'Almendras', cal: 579, p: 21, c: 22, g: 50, u: 'g', tags: ['grasaSaludable'] },
      { id: 251, n: 'Nueces', cal: 654, p: 15, c: 14, g: 65, u: 'g', tags: ['grasaSaludable', 'omega3'] },
    ],
    preparados: [
      { id: 450, n: 'Pizza', cal: 266, p: 11, c: 33, g: 10, u: 'g', tags: ['procesado'] },
      { id: 451, n: 'Hamburguesa', cal: 295, p: 17, c: 24, g: 14, u: 'g', tags: ['procesado'] },
      { id: 452, n: 'Tortilla francesa', cal: 154, p: 11, c: 1, g: 12, u: 'g', tags: ['proteina'] },
    ],
  };

  const allFoods = useMemo(() => Object.values(foods).flat(), []);
  const filtered = useMemo(() => {
    if (!searchTerm) return [];
    return allFoods.filter(f => f.n.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10);
  }, [searchTerm, allFoods]);

  // RECETAS
  const [recipes, setRecipes] = useState([
    { id: 1, name: 'Ensalada de pollo', icon: '🥗', ingredients: [
      { name: 'Pechuga pollo', cal: 248, p: 47, c: 0, g: 5 },
      { name: 'Lechuga', cal: 15, p: 1, c: 3, g: 0 },
      { name: 'Tomate', cal: 18, p: 1, c: 4, g: 0 },
    ]},
    { id: 2, name: 'Bowl proteico', icon: '🥣', ingredients: [
      { name: 'Yogur griego 0%', cal: 118, p: 20, c: 8, g: 2 },
      { name: 'Avena', cal: 156, p: 7, c: 26, g: 3 },
      { name: 'Plátano', cal: 89, p: 1, c: 23, g: 0 },
    ]},
    { id: 3, name: 'Revuelto claras', icon: '🍳', ingredients: [
      { name: 'Claras', cal: 104, p: 22, c: 2, g: 0 },
      { name: 'Jamón york', cal: 63, p: 11, c: 1, g: 2 },
    ]},
  ]);

  // HISTORIAL DE PESO
  const [weightHistory, setWeightHistory] = useState([
    { date: '26D', weight: 103.5 }, { date: '27D', weight: 103.2 }, { date: '28D', weight: 102.9 },
    { date: '29D', weight: 102.7 }, { date: '30D', weight: 102.5 }, { date: '31D', weight: 102.3 },
    { date: '1E', weight: 103.0 }, { date: '2E', weight: 102.6 }, { date: 'Hoy', weight: 102.4 },
  ]);

  // PLAN SEMANAL
  const weeklyPlan = {
    0: { desayuno: [], comida: [], cena: [] },
    1: { desayuno: [{ name: 'Bowl proteico', cal: 363, p: 28, c: 57, g: 5 }], comida: [{ name: 'Ensalada de pollo', cal: 281, p: 49, c: 7, g: 5 }], cena: [{ name: 'Salmón + verduras', cal: 350, p: 30, c: 10, g: 18 }] },
    2: { desayuno: [{ name: 'Revuelto claras', cal: 167, p: 33, c: 3, g: 2 }], comida: [{ name: 'Pollo + arroz', cal: 450, p: 40, c: 45, g: 8 }], cena: [{ name: 'Merluza plancha', cal: 250, p: 28, c: 5, g: 10 }] },
    3: { desayuno: [{ name: 'Tostadas + pavo', cal: 320, p: 25, c: 35, g: 8 }], comida: [{ name: 'Lentejas', cal: 380, p: 20, c: 50, g: 6 }], cena: [{ name: 'Tortilla', cal: 230, p: 16, c: 2, g: 18 }] },
    4: { desayuno: [{ name: 'Bowl proteico', cal: 363, p: 28, c: 57, g: 5 }], comida: [{ name: 'Ensalada pollo', cal: 281, p: 49, c: 7, g: 5 }], cena: [{ name: 'Atún ensalada', cal: 280, p: 32, c: 6, g: 12 }] },
    5: { desayuno: [{ name: 'Yogur + fruta', cal: 250, p: 12, c: 35, g: 4 }], comida: [{ name: 'Arroz + pollo', cal: 480, p: 38, c: 52, g: 10 }], cena: [{ name: 'Pescado vapor', cal: 220, p: 26, c: 4, g: 10 }] },
    6: { desayuno: [{ name: 'Huevos', cal: 300, p: 20, c: 4, g: 22 }], comida: [{ name: 'Pasta atún', cal: 480, p: 28, c: 60, g: 12 }], cena: [{ name: 'Ensalada completa', cal: 300, p: 22, c: 18, g: 14 }] },
  };
  const dayNames = ['Hoy', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // DATOS USUARIO
  const [userData, setUserData] = useState({ 
    name: 'Javi', startWeight: 104, currentWeight: 102.4, targetWeight: 84, 
    height: 180, age: 42, activityLevel: 'moderate' 
  });

  const [weekData] = useState([
    { day: 'L', cal: 1850, steps: 9200, workout: true },
    { day: 'M', cal: 1920, steps: 11500, workout: true },
    { day: 'X', cal: 1780, steps: 8700, workout: false },
    { day: 'J', cal: 1900, steps: 10200, workout: true },
    { day: 'V', cal: 2100, steps: 7800, workout: false },
    { day: 'S', cal: 1850, steps: 12100, workout: true },
    { day: 'D', cal: 0, steps: 0, workout: false },
  ]);

  const [today, setToday] = useState({ steps: 6500, water: 3, meals: [], workouts: [] });

  // OBJETIVOS DINÁMICOS
  const targets = useMemo(() => {
    const bmr = Math.round(10 * userData.currentWeight + 6.25 * userData.height - 5 * userData.age + 5);
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const tdee = Math.round(bmr * factors[userData.activityLevel]);
    const deficit = 600;
    const workoutBonus = today.workouts.length > 0 ? Math.round(today.workouts.reduce((s, w) => s + w.cal, 0) * 0.5) : 0;
    const cal = tdee - deficit + workoutBonus;
    const p = Math.round(userData.targetWeight * 2);
    const g = Math.round((cal * 0.25) / 9);
    const c = Math.round((cal - p * 4 - g * 9) / 4);
    return { bmr, tdee, deficit, cal, p, c, g, workoutBonus, steps: 10000 };
  }, [userData, today.workouts]);

  // ENTRENAMIENTOS
  const predefinedWorkouts = [
    { id: 1, name: 'Día 1: Empuje', icon: '🏋️', muscles: 'Pecho, Hombros, Tríceps', duration: 40, calPerMin: 8 },
    { id: 2, name: 'Día 2: Tirón', icon: '💪', muscles: 'Espalda, Bíceps', duration: 40, calPerMin: 8 },
    { id: 3, name: 'Día 3: Pierna', icon: '🦵', muscles: 'Glúteos, Isquios, Core', duration: 40, calPerMin: 8 },
    { id: 4, name: 'Día 4: Full Body', icon: '⚡', muscles: 'Todo el cuerpo', duration: 40, calPerMin: 9 },
  ];
  
  const workoutTypes = [
    { id: 'fuerza', name: 'Fuerza', icon: '🏋️', calPerMin: { baja: 5, media: 7, alta: 9 } },
    { id: 'cardio', name: 'Cardio', icon: '🏃', calPerMin: { baja: 6, media: 9, alta: 12 } },
    { id: 'hiit', name: 'HIIT', icon: '⚡', calPerMin: { baja: 8, media: 11, alta: 14 } },
  ];
  
  const cardioTypes = [
    { id: 'caminar', name: 'Caminar', icon: '🚶', calPerMin: 4, stepsPerMin: 100 },
    { id: 'paseoVega', name: 'Paseo Vega', icon: '👶', calPerMin: 3.5, stepsPerMin: 90 },
    { id: 'correr', name: 'Correr', icon: '🏃', calPerMin: 10, stepsPerMin: 160 },
    { id: 'bici', name: 'Bici', icon: '🚴', calPerMin: 7, stepsPerMin: 0 },
  ];

  // CÁLCULOS
  const totals = today.meals.reduce((a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, g: a.g + m.g }), { cal: 0, p: 0, c: 0, g: 0 });
  const pendingTotals = pendingMeal.reduce((a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, g: a.g + m.g }), { cal: 0, p: 0, c: 0, g: 0 });
  const totalWorkoutCal = today.workouts.reduce((s, w) => s + w.cal, 0);
  const calRem = targets.cal - totals.cal;
  const stepsPct = Math.min((today.steps / targets.steps) * 100, 100);

  const mealTargets = {
    desayuno: { cal: Math.round(targets.cal * 0.25), p: Math.round(targets.p * 0.2) },
    comida: { cal: Math.round(targets.cal * 0.35), p: Math.round(targets.p * 0.35) },
    cena: { cal: Math.round(targets.cal * 0.2), p: Math.round(targets.p * 0.2) }
  };

  // SUGERENCIAS INTELIGENTES
  const suggestions = useMemo(() => {
    const rem = { cal: targets.cal - totals.cal, p: targets.p - totals.p };
    const sug = [];
    if (rem.p > 30) sug.push({ icon: '🍗', title: `Faltan ${Math.round(rem.p)}g proteína`, opts: ['Pollo 150g', 'Yogur griego 200g', 'Atún 100g'] });
    if (rem.cal > 300 && rem.p < 20) sug.push({ icon: '🥑', title: `Faltan ${Math.round(rem.cal)} kcal`, opts: ['Aguacate', 'Almendras 25g', 'Plátano'] });
    const hasVeg = today.meals.some(m => allFoods.find(f => f.n === m.name)?.tags?.includes('verdura'));
    if (!hasVeg && totals.cal > 500) sug.push({ icon: '🥬', title: 'Sin verduras hoy', opts: ['Ensalada', 'Brócoli', 'Espinacas'] });
    if (totals.g > targets.g * 0.8) sug.push({ icon: '⚠️', title: `${Math.round(totals.g)}g grasa (máx ${targets.g}g)`, opts: ['Reduce fritos', 'Proteína magra'] });
    return sug;
  }, [totals, targets, today.meals, allFoods]);

  // FUNCIONES
  const calc = (f, q) => ({ cal: Math.round(f.cal * q / 100), p: Math.round(f.p * q / 100), c: Math.round(f.c * q / 100), g: Math.round(f.g * q / 100) });
  const calcCustomWorkoutCal = () => { const t = workoutTypes.find(x => x.id === customWorkout.type); return t ? Math.round(t.calPerMin[customWorkout.intensity] * customWorkout.duration) : 0; };
  const calcCardioCal = () => { const t = cardioTypes.find(x => x.id === selectedCardio.type); return t ? { cal: Math.round(t.calPerMin * selectedCardio.duration), steps: Math.round(t.stepsPerMin * selectedCardio.duration) } : { cal: 0, steps: 0 }; };

  const addWorkout = (w) => setToday(p => ({ ...p, workouts: [...p.workouts, w] }));
  const addToPending = () => { if (!selectedFood) return; setPendingMeal(p => [...p, { ...calc(selectedFood, foodQty), name: selectedFood.n, qty: foodQty, unit: selectedFood.u }]); setSelectedFood(null); setFoodQty(100); setSearchTerm(''); };
  const addRecipeToPending = (r) => { const t = r.ingredients.reduce((a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, g: a.g + i.g }), { cal: 0, p: 0, c: 0, g: 0 }); setPendingMeal(p => [...p, { ...t, name: r.name, qty: 1, unit: 'ración' }]); };
  const confirmMeal = () => { setToday(p => ({ ...p, meals: [...p.meals, ...pendingMeal.map(m => ({ ...m, type: mealType }))] })); setPendingMeal([]); setShowAnalysis(false); };
  const removeMeal = (i) => setToday(p => ({ ...p, meals: p.meals.filter((_, x) => x !== i) }));
  const removeWorkout = (i) => setToday(p => ({ ...p, workouts: p.workouts.filter((_, x) => x !== i) }));
  const addWeight = () => { if (!newWeight) return; setWeightHistory(p => [...p.slice(0, -1), { date: 'Hoy', weight: parseFloat(newWeight) }]); setUserData(p => ({ ...p, currentWeight: parseFloat(newWeight) })); setNewWeight(''); setShowWeightModal(false); };

  const cats = [{ k: 'carnes', i: '🥩', l: 'Carnes' }, { k: 'pescados', i: '🐟', l: 'Pescados' }, { k: 'lacteos', i: '🥛', l: 'Lácteos' }, { k: 'cereales', i: '🌾', l: 'Cereales' }, { k: 'legumbres', i: '🫘', l: 'Legumbres' }, { k: 'verduras', i: '🥬', l: 'Verduras' }, { k: 'frutas', i: '🍎', l: 'Frutas' }, { k: 'frutosSecos', i: '🥜', l: 'Secos' }, { k: 'preparados', i: '🍕', l: 'Otros' }];
  const mealLabels = { desayuno: '☀️ Desayuno', merienda1: '🍎 M.mañana', comida: '🍽️ Comida', merienda2: '🥜 Merienda', cena: '🌙 Cena' };
  const COLORS = ['#6366f1', '#22c55e', '#f59e0b'];
  const macros = [{ name: 'Prot', g: Math.round(totals.p), target: targets.p }, { name: 'Carb', g: Math.round(totals.c), target: targets.c }, { name: 'Gras', g: Math.round(totals.g), target: targets.g }];
  const calChartData = weekData.map((d, i) => ({ ...d, today: i === 6 ? totals.cal : null }));
  const stepsChartData = weekData.map((d, i) => ({ ...d, today: i === 6 ? today.steps : null }));

  // ANÁLISIS
  const analyzeMeal = () => {
    const a = { score: 100, status: 'excellent', verdict: '', alerts: [], warnings: [], positives: [], info: [] };
    const req = { desayuno: { max: 500 }, merienda1: { max: 250 }, comida: { max: 650 }, merienda2: { max: 250 }, cena: { max: 500 } }[mealType];
    if (pendingTotals.cal > req.max * 1.3) { a.alerts.push({ icon: '📈', text: `${Math.round(pendingTotals.cal)} kcal excesivo` }); a.score -= 25; }
    else if (pendingTotals.cal > req.max) { a.warnings.push({ icon: '⚠️', text: `${Math.round(pendingTotals.cal)} kcal algo alto` }); a.score -= 10; }
    else a.positives.push({ icon: '✅', text: `Calorías OK: ${Math.round(pendingTotals.cal)}` });
    const pT = mealTargets[mealType]?.p || 25;
    if (pendingTotals.p >= pT) a.positives.push({ icon: '💪', text: `Proteína: ${Math.round(pendingTotals.p)}g` });
    else if (pendingTotals.p < pT * 0.5) { a.warnings.push({ icon: '🍗', text: `Poca proteína: ${Math.round(pendingTotals.p)}g` }); a.score -= 15; }
    const proj = totals.cal + pendingTotals.cal;
    if (proj > targets.cal) { a.alerts.push({ icon: '🚨', text: `Excederás en ${Math.round(proj - targets.cal)} kcal` }); a.score -= 20; }
    else a.info.push({ icon: '📊', text: `Quedarán ${Math.round(targets.cal - proj)} kcal` });
    a.status = a.alerts.length === 0 && a.score >= 80 ? 'excellent' : a.alerts.length === 0 && a.score >= 60 ? 'good' : a.score >= 40 ? 'warning' : 'bad';
    a.verdict = a.status === 'excellent' ? '¡Excelente!' : a.status === 'good' ? 'Buena opción' : a.status === 'warning' ? 'Podría mejorar' : 'No recomendado';
    return a;
  };
  const analysis = pendingMeal.length > 0 ? analyzeMeal() : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 pb-6">
        <div className="flex justify-between items-start">
          <div><p className="text-indigo-200 text-sm">Hola, {userData.name} 👋</p><h1 className="text-xl font-bold">Tu Transformación</h1></div>
          <button onClick={() => setShowWeightModal(true)} className="bg-white/20 rounded-xl px-4 py-2"><p className="text-2xl font-bold">{userData.currentWeight}</p><p className="text-xs text-indigo-200">kg ✏️</p></button>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3"><div className="bg-gradient-to-r from-green-400 to-emerald-400 h-full rounded-full" style={{ width: `${Math.min(((userData.startWeight - userData.currentWeight) / (userData.startWeight - userData.targetWeight)) * 100, 100)}%` }} /></div>
        <div className="flex justify-between text-xs mt-2"><span>{userData.startWeight}kg</span><span className="text-green-300 font-bold">-{(userData.startWeight - userData.currentWeight).toFixed(1)}kg</span><span>{userData.targetWeight}kg</span></div>
        <div className="mt-3 flex gap-2 text-xs"><span className="bg-white/20 px-2 py-1 rounded-full">🔥 {targets.cal} kcal</span>{targets.workoutBonus > 0 && <span className="bg-green-500/30 px-2 py-1 rounded-full">+{targets.workoutBonus} entreno</span>}</div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-20 mx-3 -mt-3 rounded-xl flex">
        {[{ id: 'dashboard', i: '📊', l: 'Resumen' }, { id: 'nutrition', i: '🍽️', l: 'Comidas' }, { id: 'plan', i: '📅', l: 'Plan' }, { id: 'workout', i: '💪', l: 'Entreno' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-3 flex flex-col items-center rounded-xl ${activeTab === t.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}><span>{t.i}</span><span className="text-xs">{t.l}</span></button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (<>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-500">🔥 Calorías</span><span className={`text-xs px-2 py-0.5 rounded-full ${calRem > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{calRem > 0 ? `${Math.round(calRem)} rest` : `${Math.round(-calRem)} exc`}</span></div>
              <p className="text-2xl font-bold">{Math.round(totals.cal)}<span className="text-sm text-gray-400">/{targets.cal}</span></p>
              <div className="mt-1 bg-gray-100 rounded-full h-2"><div className={`h-full rounded-full ${totals.cal > targets.cal ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(totals.cal / targets.cal * 100, 100)}%` }} /></div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-500">👟 Pasos</span>{stepsPct >= 100 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">✓</span>}</div>
              <p className="text-2xl font-bold">{(today.steps / 1000).toFixed(1)}k<span className="text-sm text-gray-400">/10k</span></p>
              <div className="mt-1 bg-gray-100 rounded-full h-2"><div className={`h-full rounded-full ${stepsPct >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${stepsPct}%` }} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl p-3 shadow-sm"><h3 className="font-bold text-xs mb-2">🔥 Kcal semana</h3><div className="h-20"><ResponsiveContainer><BarChart data={calChartData}><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} /><YAxis hide /><Bar dataKey="cal" fill="#fdba74" radius={[3, 3, 0, 0]} /><Bar dataKey="today" fill="#f97316" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
            <div className="bg-white rounded-xl p-3 shadow-sm"><h3 className="font-bold text-xs mb-2">👟 Pasos semana</h3><div className="h-20"><ResponsiveContainer><BarChart data={stepsChartData}><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} /><YAxis hide /><Bar dataKey="steps" fill="#a5b4fc" radius={[3, 3, 0, 0]} /><Bar dataKey="today" fill="#6366f1" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between mb-3"><h3 className="font-bold text-sm">⚖️ Evolución peso</h3><button onClick={() => setShowWeightModal(true)} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">+ Añadir</button></div>
            <div className="h-28"><ResponsiveContainer><AreaChart data={weightHistory}><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} /><Tooltip /><Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} fill="url(#wg)" /></AreaChart></ResponsiveContainer></div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">🎯 Macros hoy</h3>
            <div className="flex justify-around">{macros.map((m, i) => (<div key={m.name} className="text-center"><div className="relative w-14 h-14"><svg className="w-14 h-14 transform -rotate-90"><circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="5" fill="none" /><circle cx="28" cy="28" r="24" stroke={COLORS[i]} strokeWidth="5" fill="none" strokeDasharray={`${Math.min((m.g / m.target) * 151, 151)} 151`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-bold">{Math.round((m.g / m.target) * 100)}%</span></div></div><p className="text-xs text-gray-500 mt-1">{m.name}</p><p className="text-xs font-medium">{m.g}/{m.target}g</p></div>))}</div>
          </div>

          {suggestions.length > 0 && (<div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"><h3 className="font-bold text-sm text-amber-800 mb-3">💡 Sugerencias</h3>{suggestions.slice(0, 2).map((s, i) => (<div key={i} className="bg-white rounded-lg p-3 mb-2 last:mb-0"><p className="font-medium text-sm">{s.icon} {s.title}</p><div className="mt-2 flex flex-wrap gap-1">{s.opts.map((o, j) => <span key={j} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{o}</span>)}</div></div>))}</div>)}

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">⚙️ Objetivos dinámicos</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500 text-xs">Metabolismo</p><p className="font-bold">{targets.bmr} kcal</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500 text-xs">Gasto total</p><p className="font-bold">{targets.tdee} kcal</p></div>
              <div className="bg-red-50 rounded-lg p-2"><p className="text-gray-500 text-xs">Déficit</p><p className="font-bold text-red-600">-{targets.deficit}</p></div>
              <div className="bg-green-50 rounded-lg p-2"><p className="text-gray-500 text-xs">Objetivo hoy</p><p className="font-bold text-green-600">{targets.cal} kcal</p></div>
            </div>
          </div>
        </>)}

        {/* PLAN */}
        {activeTab === 'plan' && (<>
          <div className="bg-white rounded-xl p-3 shadow-sm"><div className="flex gap-1">{dayNames.map((d, i) => <button key={i} onClick={() => setSelectedDayPlan(i)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${selectedDayPlan === i ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{d}</button>)}</div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">📅 {selectedDayPlan === 0 ? 'Plan hoy' : `Plan ${dayNames[selectedDayPlan]}`}</h3>
            {['desayuno', 'comida', 'cena'].map(meal => {
              const items = weeklyPlan[selectedDayPlan]?.[meal] || [];
              return (<div key={meal} className="mb-4 last:mb-0"><div className="flex justify-between mb-2"><span className="font-medium text-sm">{meal === 'desayuno' ? '☀️ Desayuno' : meal === 'comida' ? '🍽️ Comida' : '🌙 Cena'}</span><span className="text-sm text-orange-500 font-bold">{items.reduce((s, m) => s + m.cal, 0)} kcal</span></div>{items.length > 0 ? items.map((it, j) => (<div key={j} className="bg-gray-50 rounded-lg p-2 mb-1 flex justify-between"><div><p className="text-sm font-medium">{it.name}</p><p className="text-xs text-gray-500">P:{it.p}g C:{it.c}g G:{it.g}g</p></div>{selectedDayPlan === 0 && <button onClick={() => { setPendingMeal([it]); setMealType(meal); setActiveTab('nutrition'); }} className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">+</button>}</div>)) : <p className="text-gray-400 text-sm italic">Sin planificar</p>}</div>);
            })}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between mb-3"><h3 className="font-bold text-sm">📖 Mis recetas</h3><button onClick={() => setShowRecipeModal(true)} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">+ Nueva</button></div>
            {recipes.map(r => (<div key={r.id} className="bg-gray-50 rounded-lg p-3 mb-2 flex justify-between"><div className="flex items-center gap-2"><span className="text-2xl">{r.icon}</span><div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-500">{r.ingredients.reduce((s, i) => s + i.cal, 0)} kcal</p></div></div><button onClick={() => { addRecipeToPending(r); setActiveTab('nutrition'); }} className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">Usar</button></div>))}
          </div>
        </>)}

        {/* NUTRICIÓN */}
        {activeTab === 'nutrition' && (<>
          <div className="bg-white rounded-xl p-3 shadow-sm"><div className="grid grid-cols-3 gap-2 text-center text-sm"><div><p className="text-gray-500 text-xs">Objetivo</p><p className="font-bold text-lg">{targets.cal}</p></div><div><p className="text-gray-500 text-xs">Consumido</p><p className="font-bold text-lg text-orange-500">{Math.round(totals.cal)}</p></div><div><p className="text-gray-500 text-xs">Restante</p><p className={`font-bold text-lg ${calRem >= 0 ? 'text-green-500' : 'text-red-500'}`}>{Math.round(calRem)}</p></div></div></div>

          {suggestions.length > 0 && <button onClick={() => setShowSuggestions(!showSuggestions)} className="w-full bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-3 text-left border border-amber-200"><div className="flex justify-between"><span className="font-medium text-sm text-amber-800">💡 {suggestions.length} sugerencia{suggestions.length > 1 ? 's' : ''}</span><span>{showSuggestions ? '▲' : '▼'}</span></div>{showSuggestions && <div className="mt-3 space-y-2">{suggestions.map((s, i) => <div key={i} className="bg-white rounded-lg p-2 text-sm">{s.icon} {s.title}</div>)}</div>}</button>}

          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="font-bold text-sm mb-2">➕ Añadir comida</p>
            <div className="flex gap-1 mb-3 overflow-x-auto">{Object.entries(mealLabels).map(([k, v]) => <button key={k} onClick={() => { setMealType(k); setPendingMeal([]); }} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${mealType === k ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{v}</button>)}</div>

            {pendingMeal.length > 0 && (<div className="mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200"><p className="font-medium text-sm text-indigo-800 mb-2">🍽️ En preparación:</p>{pendingMeal.map((it, i) => <div key={i} className="flex justify-between py-1 border-b border-indigo-100 last:border-0"><span className="text-sm">{it.name}</span><div className="flex items-center gap-2"><span className="text-orange-600">{Math.round(it.cal)} kcal</span><button onClick={() => setPendingMeal(p => p.filter((_, x) => x !== i))} className="text-red-400">×</button></div></div>)}<div className="border-t border-indigo-200 mt-2 pt-2 flex justify-between font-bold text-sm"><span>Total:</span><span className="text-orange-600">{Math.round(pendingTotals.cal)} kcal</span></div><button onClick={() => setShowAnalysis(true)} className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm">🔍 Analizar</button></div>)}

            <div className="mb-3"><p className="text-xs text-gray-500 mb-2">📖 Recetas:</p><div className="flex gap-2 overflow-x-auto pb-2">{recipes.map(r => <button key={r.id} onClick={() => addRecipeToPending(r)} className="flex-shrink-0 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2"><span className="text-xl">{r.icon}</span><p className="text-xs font-medium mt-1">{r.name}</p></button>)}</div></div>

            <div className="flex gap-2 mb-2"><input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setSelectedCat(null); }} placeholder="🔍 Buscar..." className="flex-1 p-2 rounded-lg border bg-gray-50 text-sm" /><button onClick={() => setShowCustomFood(!showCustomFood)} className={`px-3 py-2 rounded-lg text-sm ${showCustomFood ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>✏️</button></div>

            {showCustomFood && (<div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200"><input value={customFood.name} onChange={e => setCustomFood(p => ({ ...p, name: e.target.value }))} placeholder="Nombre..." className="w-full p-2 rounded-lg border text-sm mb-2" /><div className="grid grid-cols-4 gap-2 mb-2">{['cal', 'p', 'c', 'g'].map(k => <div key={k}><label className="text-xs text-gray-500">{k === 'cal' ? 'Kcal*' : k.toUpperCase()}</label><input type="number" value={customFood[k]} onChange={e => setCustomFood(p => ({ ...p, [k]: e.target.value }))} className="w-full p-2 rounded-lg border text-sm text-center" /></div>)}</div><button onClick={() => { if (customFood.name && customFood.cal) { setPendingMeal(p => [...p, { name: customFood.name, cal: +customFood.cal, p: +customFood.p || 0, c: +customFood.c || 0, g: +customFood.g || 0, qty: 1, unit: 'ración' }]); setCustomFood({ name: '', cal: '', p: '', c: '', g: '' }); setShowCustomFood(false); }}} disabled={!customFood.name || !customFood.cal} className={`w-full py-2 rounded-lg font-bold text-sm ${customFood.name && customFood.cal ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'}`}>+ Añadir</button></div>)}

            {!searchTerm && !selectedFood && !showCustomFood && <div className="grid grid-cols-3 gap-1 mb-2">{cats.map(c => <button key={c.k} onClick={() => setSelectedCat(selectedCat === c.k ? null : c.k)} className={`p-2 rounded-lg text-center text-xs ${selectedCat === c.k ? 'bg-indigo-100 border border-indigo-500' : 'bg-gray-50'}`}><span className="text-lg">{c.i}</span><p className="truncate">{c.l}</p></button>)}</div>}

            {selectedCat && !searchTerm && <div className="max-h-40 overflow-y-auto space-y-1">{foods[selectedCat]?.map(f => <button key={f.id} onClick={() => { setSelectedFood(f); setFoodQty(100); }} className={`w-full p-2 rounded-lg text-left text-sm border ${selectedFood?.id === f.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}><div className="flex justify-between"><span>{f.n}</span><span className="text-orange-500 font-bold">{f.cal}</span></div></button>)}</div>}

            {searchTerm && filtered.length > 0 && <div className="max-h-40 overflow-y-auto space-y-1">{filtered.map(f => <button key={f.id} onClick={() => { setSelectedFood(f); setFoodQty(100); setSearchTerm(''); }} className="w-full p-2 rounded-lg text-left text-sm border border-gray-100 hover:bg-gray-50"><div className="flex justify-between"><span>{f.n}</span><span className="text-orange-500 font-bold">{f.cal}</span></div></button>)}</div>}

            {selectedFood && (<div className="mt-2 p-3 bg-gray-50 rounded-xl border"><p className="font-bold text-sm">{selectedFood.n}</p><div className="flex items-center gap-2 mt-2"><input type="number" value={foodQty} onChange={e => setFoodQty(+e.target.value || 0)} className="w-16 p-1 rounded border text-center text-sm" /><span className="text-xs text-gray-500">{selectedFood.u}</span><div className="flex-1 text-right"><p className="text-lg font-bold text-orange-500">{calc(selectedFood, foodQty).cal} kcal</p></div></div><div className="flex gap-1 mt-2">{[50, 100, 150, 200].map(q => <button key={q} onClick={() => setFoodQty(q)} className={`px-2 py-1 rounded text-xs ${foodQty === q ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>{q}</button>)}</div><button onClick={addToPending} className="w-full mt-2 py-2 bg-green-500 text-white rounded-lg font-bold text-sm">+ Añadir</button></div>)}
          </div>

          {today.meals.length > 0 && (<div className="bg-white rounded-xl p-3 shadow-sm"><p className="font-bold text-sm mb-2">✅ Registrado</p>{Object.entries(mealLabels).map(([type, label]) => { const items = today.meals.filter(m => m.type === type); if (!items.length) return null; return (<div key={type} className="mb-2"><p className="text-xs font-medium text-gray-500">{label} ({Math.round(items.reduce((s, m) => s + m.cal, 0))} kcal)</p>{items.map((m, i) => { const idx = today.meals.indexOf(m); return (<div key={i} className="flex justify-between py-1 border-b border-gray-50 text-sm"><span>{m.name}</span><div className="flex items-center gap-2"><span>{Math.round(m.cal)}</span><button onClick={() => removeMeal(idx)} className="text-red-400">×</button></div></div>);})}</div>);})}</div>)}
        </>)}

        {/* ENTRENO */}
        {activeTab === 'workout' && (<>
          {today.workouts.length > 0 && <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white"><p className="text-sm opacity-90">🎉 ¡Has entrenado!</p><p className="text-2xl font-bold">{totalWorkoutCal} kcal</p><p className="text-sm opacity-90">+{targets.workoutBonus} kcal extra</p></div>}

          {today.workouts.length > 0 && (<div className="bg-white rounded-xl p-3 shadow-sm"><p className="font-bold text-sm mb-2">✅ Entrenos</p>{today.workouts.map((w, i) => <div key={i} className="flex justify-between py-2 border-b border-gray-50 last:border-0"><div className="flex items-center gap-2"><span className="text-xl">{w.icon}</span><div><p className="font-medium text-sm">{w.name}</p><p className="text-xs text-gray-500">{w.duration} min</p></div></div><div className="flex items-center gap-2"><span className="text-orange-500 font-bold">{w.cal} kcal</span><button onClick={() => removeWorkout(i)} className="text-red-400">×</button></div></div>)}</div>)}

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="font-bold text-sm mb-3">➕ Añadir entreno</p>
            <div className="flex gap-1 mb-4">{[{ id: 'predefined', icon: '📋', label: 'Plan' }, { id: 'custom', icon: '🎛️', label: 'Custom' }, { id: 'cardio', icon: '🚶', label: 'Cardio' }].map(m => <button key={m.id} onClick={() => setWorkoutMode(m.id)} className={`flex-1 py-2 rounded-lg font-medium text-sm ${workoutMode === m.id ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>{m.icon} {m.label}</button>)}</div>

            {workoutMode === 'predefined' && <div className="space-y-2">{predefinedWorkouts.map(w => <button key={w.id} onClick={() => addWorkout({ ...w, cal: Math.round(w.duration * w.calPerMin), steps: 0 })} className="w-full p-3 rounded-xl border border-gray-200 text-left hover:bg-gray-50"><div className="flex items-center gap-2"><span className="text-2xl">{w.icon}</span><div className="flex-1"><p className="font-medium text-sm">{w.name}</p><p className="text-xs text-gray-500">{w.muscles}</p></div><div className="text-right"><p className="font-bold text-purple-600">{w.duration}min</p><p className="text-xs text-orange-500">{Math.round(w.duration * w.calPerMin)} kcal</p></div></div></button>)}</div>}

            {workoutMode === 'custom' && (<div className="space-y-4"><div><p className="text-xs text-gray-500 mb-2">Tipo:</p><div className="grid grid-cols-3 gap-1">{workoutTypes.map(t => <button key={t.id} onClick={() => setCustomWorkout(p => ({ ...p, type: t.id }))} className={`p-2 rounded-lg text-center ${customWorkout.type === t.id ? 'bg-purple-100 border border-purple-500' : 'bg-gray-50'}`}><span className="text-xl">{t.icon}</span><p className="text-xs">{t.name}</p></button>)}</div></div><div><p className="text-xs text-gray-500 mb-2">Duración: {customWorkout.duration}min</p><div className="flex gap-1">{[20, 30, 40, 50, 60].map(d => <button key={d} onClick={() => setCustomWorkout(p => ({ ...p, duration: d }))} className={`flex-1 py-2 rounded-lg text-sm ${customWorkout.duration === d ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>{d}</button>)}</div></div><div><p className="text-xs text-gray-500 mb-2">Intensidad:</p><div className="flex gap-1">{['baja', 'media', 'alta'].map(i => <button key={i} onClick={() => setCustomWorkout(p => ({ ...p, intensity: i }))} className={`flex-1 py-2 rounded-lg text-sm capitalize ${customWorkout.intensity === i ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>{i}</button>)}</div></div><div className="bg-purple-50 rounded-xl p-4 text-center"><p className="text-sm text-gray-600">Calorías:</p><p className="text-3xl font-bold text-purple-600">{calcCustomWorkoutCal()} kcal</p></div><button onClick={() => { const t = workoutTypes.find(x => x.id === customWorkout.type); addWorkout({ name: `${t.name} ${customWorkout.intensity}`, icon: t.icon, duration: customWorkout.duration, cal: calcCustomWorkoutCal(), steps: 0 }); }} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">✓ Registrar</button></div>)}

            {workoutMode === 'cardio' && (<div className="space-y-4"><div className="grid grid-cols-2 gap-2">{cardioTypes.map(c => <button key={c.id} onClick={() => setSelectedCardio(p => ({ ...p, type: c.id }))} className={`p-3 rounded-xl text-center ${selectedCardio.type === c.id ? 'bg-blue-100 border border-blue-500' : 'bg-gray-50'}`}><span className="text-2xl">{c.icon}</span><p className="text-sm mt-1">{c.name}</p></button>)}</div><div><p className="text-xs text-gray-500 mb-2">Duración: {selectedCardio.duration}min</p><div className="flex gap-1">{[15, 20, 30, 45, 60].map(d => <button key={d} onClick={() => setSelectedCardio(p => ({ ...p, duration: d }))} className={`flex-1 py-2 rounded-lg text-sm ${selectedCardio.duration === d ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{d}</button>)}</div></div><div className="bg-blue-50 rounded-xl p-4 text-center"><div className="flex justify-around"><div><p className="text-2xl font-bold text-orange-500">{calcCardioCal().cal}</p><p className="text-xs text-gray-500">kcal</p></div>{calcCardioCal().steps > 0 && <div><p className="text-2xl font-bold text-blue-500">+{calcCardioCal().steps}</p><p className="text-xs text-gray-500">pasos</p></div>}</div></div><button onClick={() => { const t = cardioTypes.find(x => x.id === selectedCardio.type); const d = calcCardioCal(); addWorkout({ name: t.name, icon: t.icon, duration: selectedCardio.duration, cal: d.cal, steps: d.steps }); if (d.steps > 0) setToday(p => ({ ...p, steps: p.steps + d.steps })); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">✓ Registrar</button></div>)}
          </div>
        </>)}
      </div>

      {/* MODALES */}
      {showAnalysis && analysis && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAnalysis(false)}><div className="bg-white w-full max-w-md rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}><div className={`p-4 text-white ${analysis.status === 'excellent' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : analysis.status === 'good' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : analysis.status === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}><div className="flex justify-between"><div className="flex items-center gap-3"><span className="text-4xl">{analysis.status === 'excellent' ? '🌟' : analysis.status === 'good' ? '👍' : analysis.status === 'warning' ? '⚠️' : '🚫'}</span><h3 className="text-lg font-bold">{analysis.verdict}</h3></div><button onClick={() => setShowAnalysis(false)} className="text-white/70 text-2xl">×</button></div></div><div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto"><div className="bg-gray-50 rounded-xl p-3"><div className="grid grid-cols-4 gap-2 text-center"><div><p className="text-xl font-bold text-orange-500">{Math.round(pendingTotals.cal)}</p><p className="text-xs">kcal</p></div><div><p className="text-xl font-bold text-indigo-500">{Math.round(pendingTotals.p)}g</p><p className="text-xs">prot</p></div><div><p className="text-xl font-bold text-green-500">{Math.round(pendingTotals.c)}g</p><p className="text-xs">carb</p></div><div><p className="text-xl font-bold text-amber-500">{Math.round(pendingTotals.g)}g</p><p className="text-xs">grasa</p></div></div></div>{analysis.alerts.map((a, i) => <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"><span>{a.icon}</span><span className="text-sm text-red-700">{a.text}</span></div>)}{analysis.warnings.map((w, i) => <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2"><span>{w.icon}</span><span className="text-sm text-amber-700">{w.text}</span></div>)}{analysis.positives.map((p, i) => <div key={i} className="bg-green-50 rounded-lg p-2 flex items-center gap-2"><span>{p.icon}</span><span className="text-sm text-green-700">{p.text}</span></div>)}{analysis.info.map((f, i) => <div key={i} className="bg-blue-50 rounded-lg p-2 flex items-center gap-2"><span>{f.icon}</span><span className="text-sm text-blue-700">{f.text}</span></div>)}</div><div className="p-4 border-t flex gap-2"><button onClick={() => setShowAnalysis(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Modificar</button><button onClick={confirmMeal} className={`flex-1 py-3 rounded-xl font-bold text-white ${analysis.status === 'bad' ? 'bg-red-500' : 'bg-green-500'}`}>{analysis.status === 'bad' ? 'Confirmar igual' : '✓ Confirmar'}</button></div></div></div>)}

      {showWeightModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowWeightModal(false)}><div className="bg-white w-full max-w-sm rounded-2xl p-5" onClick={e => e.stopPropagation()}><h3 className="font-bold text-lg mb-4">⚖️ Registrar peso</h3><div className="flex items-center gap-3 mb-4"><input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder={userData.currentWeight.toString()} className="flex-1 p-3 border rounded-xl text-2xl font-bold text-center" /><span className="text-gray-500">kg</span></div><div className="flex gap-2"><button onClick={() => setShowWeightModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button><button onClick={addWeight} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Guardar</button></div></div></div>)}

      {showRecipeModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowRecipeModal(false)}><div className="bg-white w-full max-w-sm rounded-2xl p-5" onClick={e => e.stopPropagation()}><h3 className="font-bold text-lg mb-4">📖 Nueva receta</h3><p className="text-gray-500 text-sm mb-4">Próximamente podrás crear tus propias recetas combinando alimentos.</p><button onClick={() => setShowRecipeModal(false)} className="w-full py-3 bg-gray-100 rounded-xl font-bold">Cerrar</button></div></div>)}
    </div>
  );
}
