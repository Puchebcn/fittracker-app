# 🏋️ FitTracker - Documento de Proyecto

## 📌 RESUMEN EJECUTIVO

App móvil (iOS/Android) de tracking fitness personalizada para transformación física.
- **Usuario objetivo**: Javi, 42 años, 180cm, 104kg → 84kg (6 meses)
- **Stack recomendado**: React Native + Expo + Supabase
- **Estado actual**: Prototipo funcional en React (web)

---

## 👤 DATOS DEL USUARIO

```
Nombre: Javi
Edad: 42 años
Altura: 180 cm
Peso inicial: 104 kg
Peso objetivo: 84 kg
Plazo: 6 meses
Nivel actividad: Moderado
Entrenamiento: 4 días/semana
Objetivo calórico base: ~1.800-1.900 kcal/día
Proteína objetivo: 168g/día (2g x kg objetivo)
```

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS (Prototipo)

### 1. Dashboard
- Progreso de peso (gráfico de área)
- Calorías consumidas vs objetivo
- Pasos del día
- Gráficos semanales (calorías y pasos)
- Macros del día (anillos de progreso)
- Sugerencias inteligentes

### 2. Nutrición
- Base de datos de ~80 alimentos en 9 categorías
- Buscador de alimentos
- Añadir comida manual (nombre + macros)
- 5 tipos de comida: Desayuno, Media mañana, Comida, Merienda, Cena
- Análisis inteligente antes de confirmar comida:
  - Detecta exceso de calorías
  - Detecta falta de proteína
  - Detecta alimentos procesados
  - Detecta impacto en objetivo diario
- Registro de comidas del día

### 3. Plan Semanal
- Vista de 7 días
- Comidas planificadas por día
- Poder añadir del plan al día actual
- Recetas guardadas (combinaciones de alimentos)

### 4. Entrenamientos
- Entrenamientos predefinidos (Plan de 4 días):
  - Día 1: Empuje (Pecho, Hombros, Tríceps)
  - Día 2: Tirón (Espalda, Bíceps)
  - Día 3: Pierna + Core
  - Día 4: Full Body
- Entrenamiento personalizado (tipo, duración, intensidad)
- Cardio (Caminar, Paseo con Vega, Correr, Bici)
- Cálculo automático de calorías quemadas

### 5. Objetivos Dinámicos
- Cálculo BMR (Mifflin-St Jeor)
- Cálculo TDEE según actividad
- Déficit automático (600 kcal)
- Bonus por entrenamiento (+50% calorías quemadas)
- Recálculo de macros según peso actual

### 6. Sugerencias Inteligentes
- Detecta falta de proteína → sugiere alimentos
- Detecta falta de calorías → sugiere snacks
- Detecta ausencia de verduras
- Advierte exceso de grasa

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tablas principales:

```sql
-- Usuarios
users (
  id, email, password_hash, name, 
  birth_date, height_cm, 
  start_weight, current_weight, target_weight,
  activity_level, created_at
)

-- Historial de peso
weight_history (
  id, user_id, weight, measured_at
)

-- Alimentos (catálogo)
foods (
  id, name, category,
  calories_per_100, protein_per_100, carbs_per_100, fat_per_100,
  unit, tags[], is_custom, user_id
)

-- Comidas registradas
meal_entries (
  id, user_id, food_id, 
  meal_type, quantity, 
  calories, protein, carbs, fat,
  logged_at
)

-- Recetas
recipes (
  id, user_id, name, icon,
  created_at
)

-- Ingredientes de recetas
recipe_ingredients (
  id, recipe_id, food_id, quantity
)

-- Plan semanal
weekly_plan (
  id, user_id, day_of_week, meal_type,
  recipe_id OR custom_meal_name,
  calories, protein, carbs, fat
)

-- Entrenamientos
workouts (
  id, user_id, workout_type, name,
  duration_min, calories_burned, steps_added,
  logged_at
)

-- Agua
water_log (
  id, user_id, glasses, logged_at
)

-- Pasos
steps_log (
  id, user_id, steps, logged_at
)
```

---

## 📱 CATEGORÍAS DE ALIMENTOS

1. **Carnes**: Pollo, Pavo, Ternera, Cerdo, Jamón
2. **Pescados**: Salmón, Atún, Merluza, Gambas
3. **Lácteos**: Huevos, Yogur, Leche, Queso, Requesón
4. **Cereales**: Arroz, Pasta, Pan, Avena, Quinoa
5. **Legumbres**: Garbanzos, Lentejas, Judías
6. **Verduras**: Tomate, Lechuga, Espinacas, Brócoli, etc.
7. **Frutas**: Manzana, Plátano, Naranja, Aguacate
8. **Frutos Secos**: Almendras, Nueces
9. **Preparados**: Pizza, Hamburguesa, Tortilla

---

## 🎯 FÓRMULAS CLAVE

### Metabolismo Basal (BMR) - Mifflin-St Jeor:
```
BMR = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) + 5
```

### TDEE (Gasto Total):
```
Factores de actividad:
- Sedentario: 1.2
- Ligero: 1.375
- Moderado: 1.55
- Activo: 1.725

TDEE = BMR × factor
```

### Objetivo calórico:
```
Objetivo = TDEE - déficit + bonus_entreno
Déficit = 600 kcal (para perder ~0.5-0.75 kg/semana)
Bonus entreno = calorías_quemadas × 0.5
```

### Macros:
```
Proteína = peso_objetivo × 2 (gramos)
Grasa = (objetivo_cal × 0.25) / 9 (gramos)
Carbos = (objetivo_cal - proteína×4 - grasa×9) / 4 (gramos)
```

### Distribución por comida:
```
Desayuno: 25% calorías, 20% proteína
Media mañana: 10% calorías, 10% proteína
Comida: 35% calorías, 35% proteína
Merienda: 10% calorías, 15% proteína
Cena: 20% calorías, 20% proteína
```

---

## 🏋️ PLAN DE ENTRENAMIENTO

### Rutina 4 días (Empuje/Tirón/Pierna/Full):

**Día 1 - Empuje:**
- Press banca/flexiones
- Press militar
- Fondos/extensiones tríceps

**Día 2 - Tirón:**
- Dominadas/remo
- Curl bíceps
- Face pulls

**Día 3 - Pierna + Core:**
- Sentadillas
- Peso muerto rumano
- Plancha/crunch

**Día 4 - Full Body:**
- Ejercicios compuestos variados

### Cardio:
- Caminar: 4 kcal/min, 100 pasos/min
- Paseo con Vega: 3.5 kcal/min, 90 pasos/min
- Correr: 10 kcal/min, 160 pasos/min
- Bici: 7 kcal/min, 0 pasos

---

## 🛠️ STACK TECNOLÓGICO RECOMENDADO

### Frontend:
- **React Native** con **Expo** (desarrollo multiplataforma)
- **TypeScript** (tipado fuerte)
- **NativeWind** (Tailwind para React Native)
- **React Navigation** (navegación)
- **Zustand** o **Redux Toolkit** (estado global)
- **React Query / TanStack Query** (caché y sincronización)

### Backend:
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
  - Autenticación (email/password, Google, Apple)
  - Base de datos PostgreSQL
  - Row Level Security (RLS)
  - Edge Functions (si se necesita lógica servidor)

### Alternativa Backend:
- **Firebase** (si prefieres NoSQL)
- **PocketBase** (self-hosted, más simple)

### Gráficos:
- **Victory Native** o **React Native Chart Kit**

### Almacenamiento local:
- **AsyncStorage** (datos simples)
- **WatermelonDB** (offline-first, sincronización)

---

## 📂 ESTRUCTURA DE CARPETAS SUGERIDA

```
/app
  /(tabs)
    /index.tsx        # Dashboard
    /nutrition.tsx    # Comidas
    /plan.tsx         # Plan semanal
    /workout.tsx      # Entrenamientos
    /profile.tsx      # Perfil/ajustes
  /_layout.tsx

/components
  /ui               # Botones, inputs, cards genéricos
  /charts           # Gráficos reutilizables
  /nutrition        # Componentes de nutrición
  /workout          # Componentes de entreno

/lib
  /supabase.ts      # Cliente Supabase
  /calculations.ts  # Fórmulas BMR, TDEE, macros
  /constants.ts     # Constantes (alimentos base, etc.)

/hooks
  /useAuth.ts
  /useNutrition.ts
  /useWorkouts.ts
  /useWeight.ts

/stores
  /userStore.ts
  /nutritionStore.ts

/types
  /database.ts      # Tipos de Supabase
  /nutrition.ts
  /workout.ts
```

---

## 🚀 FASES DE DESARROLLO

### Fase 1: Setup y Autenticación
- [ ] Crear proyecto Expo
- [ ] Configurar Supabase
- [ ] Implementar login/registro
- [ ] Crear tablas base de datos
- [ ] Diseñar esquema RLS

### Fase 2: Core Nutrición
- [ ] CRUD alimentos personalizados
- [ ] Registro de comidas
- [ ] Búsqueda de alimentos
- [ ] Cálculo de totales diarios

### Fase 3: Dashboard
- [ ] Mostrar progreso del día
- [ ] Gráficos de peso
- [ ] Gráficos semanales
- [ ] Macros del día

### Fase 4: Entrenamientos
- [ ] Registro de entrenamientos
- [ ] Cálculo de calorías quemadas
- [ ] Historial de entrenos

### Fase 5: Plan y Recetas
- [ ] CRUD recetas
- [ ] Plan semanal
- [ ] Copiar comidas

### Fase 6: Mejoras
- [ ] Sugerencias inteligentes
- [ ] Notificaciones (agua, comidas)
- [ ] Widgets iOS/Android
- [ ] Modo offline

### Fase 7: Publicación
- [ ] Testing
- [ ] App Store / Play Store
- [ ] Onboarding

---

## 📎 ARCHIVOS RELACIONADOS

- `fitness_v2.jsx` - Prototipo React actual (referencia UI)
- `Plan_Transformacion_Javi.docx` - Plan de transformación original

---

## 💡 NOTAS IMPORTANTES

1. **Vega** es la hija de Javi (5 meses) - hay cardio "Paseo con Vega"
2. El usuario tiene experiencia con **PowerApps, React, SharePoint**
3. Prefiere soluciones **completas y profesionales**
4. El prototipo actual funciona bien - migrar la lógica existente
5. Considerar **modo offline** por si no hay conexión

---

## 🔑 DECISIONES PENDIENTES

1. ¿Expo Go o Expo Development Build?
2. ¿Supabase Cloud o Self-hosted?
3. ¿Incluir login social (Google/Apple)?
4. ¿Integración con Health Kit / Google Fit?
5. ¿Escaneo de código de barras para alimentos?

---

*Última actualización: Enero 2025*
