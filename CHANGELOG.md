# CHANGELOG - FitTracker App

## [0.2.1] - Corrección Balance Energético - 2025-01-11

### 🔧 Corrección Crítica

#### Balance Energético Corregido
**Problema detectado:** El balance anterior (v0.2.0) calculaba incorrectamente el gasto energético, restando los pasos diarios cuando estos ya estaban incluidos en el TDEE (gasto energético total diario).

**Solución implementada:**
- ✅ Balance simple: **Consumido vs Objetivo**
- ✅ Eliminado el doble conteo de actividad diaria
- ✅ TDEE ya incluye pasos normales, estar de pie, actividad diaria
- ✅ Solo se ajusta el objetivo por entrenamientos EXTRA planificados

### 📊 Cambios Técnicos

#### Fórmula Anterior (INCORRECTA):
```typescript
quemado = entrenamientos + (pasos × 0.04)
neto = consumido - quemado
balance = neto - objetivo
// ❌ Error: Doble conteo de pasos
```

#### Fórmula Nueva (CORRECTA):
```typescript
objetivo = TDEE - déficit + bonus_entreno
balance = consumido - objetivo
// ✅ Correcto: TDEE ya incluye actividad base
```

### 🎨 Cambios Visuales en Dashboard

#### Card de Balance Rediseñada:
```
ANTES (v0.2.0):
┌─────────────────────────────────┐
│ Consumido - Quemado = Neto     │ ← Confuso
│   2500       560      1940     │
└─────────────────────────────────┘

AHORA (v0.2.1):
┌─────────────────────────────────┐
│ Has consumido  vs  Tu objetivo │ ← Claro
│     2500              2582      │
└─────────────────────────────────┘
```

#### Elementos Eliminados:
- ❌ Métrica "Quemado" (causaba confusión)
- ❌ Métrica "Neto" (innecesaria)
- ❌ Cards separadas de Pasos e Hidratación

#### Elementos Añadidos:
- ✅ Footer informativo en balance (Entrenos, Pasos, Agua)
- ✅ Nota educativa: "💡 Tu objetivo ya incluye tu actividad diaria base"
- ✅ Comparación directa Consumido vs Objetivo

### 📚 Documentación

#### Nuevo archivo: `docs/BALANCE_EXPLANATION.md`
Documento técnico completo que explica:
- Por qué el cálculo anterior era incorrecto
- Cómo funciona el nuevo sistema
- Ejemplos prácticos con datos reales
- Fundamento científico y referencias
- Comparación lado a lado de ambos métodos

### 🎯 Cómo Funciona Ahora

#### Cálculo del Objetivo Diario:
```
1. BMR = Metabolismo basal (~1,950 kcal)
   └─ Energía para funciones vitales

2. TDEE = BMR × Factor actividad (1.55 moderado)
   = 3,022 kcal
   Ya incluye:
   ├─ Metabolismo basal (1,950)
   ├─ Pasos diarios normales (~320)
   ├─ Estar de pie, cocinar (~400)
   └─ Actividad diaria habitual (~352)

3. Déficit = -600 kcal (perder ~0.5 kg/semana)

4. Objetivo base = TDEE - déficit = 2,422 kcal

5. Bonus entreno (solo ejercicio EXTRA)
   = calorías_entreno × 0.5 = 160 kcal

6. Objetivo final = 2,582 kcal
```

#### Sistema de Semáforo:
```
Diferencia = Consumido - Objetivo

🟢 Excelente:  ±200 kcal
🟡 Bueno:      200-400 kcal
🟠 Advertencia: 400-600 kcal
🔴 Peligro:    >600 kcal
```

### 💡 Mejoras en UX

#### Mensaje más claro:
- **Antes:** "Balance neto: 1,940 kcal" (¿qué significa?)
- **Ahora:** "Has consumido 2,500 kcal vs objetivo 2,582 kcal"

#### Información contextual:
- Entrenos, pasos y agua visibles como referencia
- No afectan el cálculo del balance
- Ayudan a entender la actividad del día

### 🐛 Bugs Corregidos

- ✅ Doble conteo de actividad diaria eliminado
- ✅ Balance ahora refleja la realidad nutricional
- ✅ Cálculos alineados con métodos profesionales
- ✅ Objetivo ajustado correctamente por entrenamientos

### 📝 Ejemplo Práctico

**Caso: Día con entrenamiento**

```
Datos del día:
- Comes: 2,500 kcal
- Entrenas: 320 kcal (40 min gimnasio)
- Caminas: 8,000 pasos

❌ ANTES (v0.2.0 - Incorrecto):
  Consumido:  2,500 kcal
  Quemado:    -580 kcal (320 entreno + 260 pasos)
  Neto:       1,920 kcal
  Objetivo:   2,000 kcal
  Balance:    -80 kcal (déficit)
  
  Problema: Los 8,000 pasos ya estaban incluidos
            en el TDEE (factor moderado = 1.55)

✅ AHORA (v0.2.1 - Correcto):
  Consumido:  2,500 kcal
  Objetivo:   2,582 kcal (base 2,422 + bonus 160)
  Balance:    -82 kcal (ligero déficit)
  Estado:     🟢 Perfecto
  
  Correcto: Los pasos normales están en el TDEE,
            solo bonificamos el entreno extra (50%)
```

### 🔗 Referencias Científicas

- **Mifflin-St Jeor** (1990): Fórmula BMR más precisa que Harris-Benedict
- **ACSM** (American College of Sports Medicine): Factores de actividad estándar
- **Déficit 500-600 kcal/día**: Pérdida sostenible de ~0.5 kg/semana

---

## [0.2.0] - Dashboard Mejorado con Balance Energético - 2025-01-10

**⚠️ NOTA IMPORTANTE:** Esta versión contenía un error de doble conteo en el cálculo del balance energético que fue corregido en v0.2.1. Se recomienda actualizar inmediatamente a v0.2.1.

### 🎯 Nuevas Funcionalidades

#### Balance Energético (con error corregido en v0.2.1)
- **Card principal de balance** que muestra:
  - Calorías consumidas (de las comidas)
  - Calorías quemadas (entrenamientos + pasos estimados) ← **ERROR: Doble conteo**
  - Balance neto (consumido - quemado)
  - Comparación con objetivo del día
  - Diferencia con el objetivo (exceso o déficit adicional)

#### Sistema de Semáforo ✅
- **Estado del balance con 4 niveles**:
  - 🟢 **Excelente** (±200 kcal): "¡Perfecto! Estás en tu objetivo"
  - 🟡 **Bueno** (200-400 kcal): "Ligeramente por encima/debajo"
  - 🟠 **Advertencia** (400-600 kcal): "Cuidado, te estás excediendo/muy bajo"
  - 🔴 **Peligro** (>600 kcal): "¡Demasiadas calorías!/¡Muy poco!"
- Código de colores dinámico según el estado
- Emoji y mensaje personalizado para cada nivel

#### Widget de Margen Disponible ✅
- **Muestra calorías disponibles** para próximas comidas
- **Sugerencias inteligentes**:
  - < 0 kcal: "Ya superaste tu objetivo. Evita más comidas hoy"
  - < 300 kcal: "Cena ligera: ensalada o proteína magra"
  - < 600 kcal: "Comida moderada: proteína + verduras + carbohidratos"
  - > 600 kcal: "Puedes comer normalmente"
- **Categorización visual** (ligera/moderada/completa)
- Iconos según tipo de comida recomendada

#### Cálculo de Calorías Quemadas (corregido en v0.2.1)
- **Entrenamientos**: Calorías registradas manualmente
- **Pasos**: Estimación automática (0.04 kcal por paso) ← **ERROR en v0.2.0**
- **Total combinado** para cálculo del balance

#### Mejoras Visuales ✅
- Barra de progreso mejorada con indicador de objetivo
- Métricas presentadas de forma más clara
- Bordes de colores dinámicos según estado del balance
- Card de hidratación movido junto a pasos

### ⚙️ Mejoras Técnicas

#### Lógica de Balance (corregida en v0.2.1)
```typescript
// v0.2.0 - INCORRECTO (doble conteo)
netCalories = consumed - (workoutCalories + stepsCalories)
difference = netCalories - target

// v0.2.1 - CORRECTO
balance = consumed - target
```

#### Tipos TypeScript
- `BalanceStatus`: 'excellent' | 'good' | 'warning' | 'danger'
- `BalanceInfo`: Interface completa para el balance energético
- Tipado estricto en todos los cálculos

### 📊 Métricas Implementadas

**Balance Energético (v0.2.0 - con error):**
- Consumido: Suma de calorías de todas las comidas del día
- Quemado entrenos: Calorías de workouts registrados
- Quemado pasos: steps × 0.04 kcal ← **ERROR**
- Total quemado: entrenamientos + pasos
- Neto: consumido - total quemado
- Diferencia: neto - objetivo

**Margen Disponible:**
- Restante = objetivo - neto
- Categorías: ligera (<300), moderada (300-600), completa (>600)

### 🎨 Experiencia de Usuario

#### Feedback Visual Inmediato ✅
- El usuario ve al instante si va bien o mal en su día
- Colores intuitivos (verde = bien, rojo = mal)
- Mensajes claros y accionables

#### Información Contextual ✅
- No solo números, sino sugerencias prácticas
- Ayuda a tomar decisiones sobre próximas comidas
- Motivación positiva cuando va bien

#### Diseño Limpio ✅
- Cards bien organizadas por prioridad
- Balance energético como protagonista
- Información secundaria accesible pero no invasiva

### 🛠️ Cambios en la Estructura

#### Componentes Modificados
- `app/(tabs)/index.tsx`: Dashboard completamente rediseñado
- Nuevos cálculos en `useMemo` para optimización
- Hooks de datos existentes (`useUserData`) sin cambios

#### Estilos Añadidos
```
- balanceCard: Card principal del balance
- balanceMetrics: Grid de métricas (Consumido/Quemado/Neto)
- balanceBar: Barra visual del balance
- marginCard: Widget de margen disponible
- marginSuggestion: Card de sugerencia de comida
```

---

## [0.1.0] - Dashboard Conectado - 2025-01-05

### ✅ Implementado

#### Sistema de Autenticación
- Login con email y contraseña
- Registro de usuarios en 2 pasos
- Logout funcional
- Persistencia de sesión con AsyncStorage
- Protección de rutas automática

#### Dashboard Funcional
- **Header personalizado**
  - Saludo con nombre del usuario
  - Peso actual editable
  - Barra de progreso visual
  - Indicadores de peso (inicial, actual, objetivo)
  - Tags con calorías objetivo y bonus de entrenamiento

- **Tarjetas de resumen**
  - Calorías consumidas vs objetivo
  - Pasos del día vs 10,000
  - Indicadores de estado (restante/excedido)

- **Macros del día**
  - Círculos de progreso para Proteína, Carbohidratos y Grasa
  - Comparación visual con objetivos calculados
  - Porcentajes dinámicos

- **Objetivos dinámicos**
  - Metabolismo basal (BMR) - Fórmula Mifflin-St Jeor
  - Gasto energético total (TDEE)
  - Déficit calórico configurado
  - Objetivo del día con bonus de entrenamiento

- **Historial de peso**
  - Scroll horizontal con últimas 10 entradas
  - Botón para añadir nuevo peso
  - Modal funcional para registro

- **Hidratación**
  - Contador de vasos de agua del día

- **Pull to Refresh**
  - Actualización de datos deslizando hacia abajo

#### Hooks y Utilidades
- **useUserData**: Hook personalizado para gestionar datos del usuario
  - Obtiene perfil desde tabla `users`
  - Carga historial de peso
  - Calcula estadísticas diarias (comidas, pasos, agua, entrenamientos)
  - Obtiene datos semanales para futuros gráficos
  - Función refresh() para actualizar datos

- **calculations.ts**: Funciones de cálculo nutricional
  - `calculateBMR()`: Metabolismo basal
  - `calculateTDEE()`: Gasto energético total
  - `calculateDailyCalorieTarget()`: Objetivo con déficit y bonus
  - `calculateMacros()`: Distribución de proteína, carbos y grasa
  - `calculateWeightProgress()`: Progreso de pérdida de peso
  - `calculateAge()`: Edad desde fecha de nacimiento
  - Funciones auxiliares de formato

#### Base de Datos (Supabase)
- **10 tablas configuradas**:
  - `users`: Perfil completo del usuario
  - `weight_history`: Historial de pesajes
  - `foods`: Catálogo de alimentos (245+ precargados)
  - `meal_entries`: Registro de comidas
  - `recipes`: Recetas personalizadas
  - `recipe_ingredients`: Ingredientes de recetas
  - `weekly_plan`: Plan semanal de comidas
  - `workouts`: Registro de entrenamientos
  - `water_log`: Consumo de agua
  - `steps_log`: Pasos diarios

- **Row Level Security (RLS)** configurado
  - Aislamiento de datos por usuario
  - Políticas de lectura/escritura seguras
  - Alimentos públicos accesibles para todos

- **245+ alimentos precargados** en 9 categorías:
  - Carnes, Pescados, Lácteos
  - Cereales, Legumbres
  - Verduras, Frutas, Frutos Secos
  - Preparados

### 🎯 Fórmulas Implementadas

```
BMR = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) + 5

TDEE = BMR × factor_actividad
- Sedentario: 1.2
- Ligero: 1.375
- Moderado: 1.55
- Activo: 1.725

Objetivo = TDEE - 600 + (calorías_quemadas × 0.5)

Macros:
- Proteína: peso_objetivo × 2g
- Grasa: (objetivo_cal × 0.25) / 9
- Carbos: (objetivo_cal - proteína×4 - grasa×9) / 4
```

### 📦 Stack Tecnológico

#### Frontend
- React Native con Expo SDK 54
- TypeScript
- React Native StyleSheet (sin NativeWind)
- Expo Router para navegación

#### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Row Level Security (RLS)

#### Dependencias Principales
```json
{
  "@supabase/supabase-js": "^2.89.0",
  "@react-native-async-storage/async-storage": "2.2.0",
  "react-native-url-polyfill": "^3.0.0",
  "expo": "~54.0.30",
  "expo-router": "~6.0.21"
}
```

### 🚧 Pendiente de Implementar

#### Funcionalidades
- [ ] Pantalla de Nutrición completa (implementada parcialmente)
- [ ] Pantalla de Entrenamientos (registrar entrenos)
- [ ] Pantalla de Plan Semanal
- [ ] Pantalla de Perfil completa
- [ ] Gráficos visuales (peso, calorías, pasos)
- [ ] Notificaciones
- [ ] Modo offline

#### Mejoras
- [ ] Optimización de consultas a Supabase
- [ ] Cache de datos
- [ ] Manejo de errores mejorado
- [ ] Testing unitario
- [ ] Testing de integración

### 📝 Notas Técnicas

- El proyecto usa path aliases `@/` para imports
- Todos los componentes usan StyleSheet en lugar de NativeWind
- La autenticación persiste en AsyncStorage
- Los datos se actualizan con pull-to-refresh
- El modal de peso actualiza tanto `weight_history` como `users.current_weight`

### 👤 Usuario de Prueba

```
Nombre: Javi
Edad: 42 años
Altura: 180 cm
Peso inicial: 104 kg
Peso objetivo: 84 kg
Nivel actividad: Moderado
```

### 🐛 Problemas Conocidos

- ~~react-native-chart-kit causa errores de TypeScript~~ ✅ RESUELTO: Removido temporalmente
- Los gráficos se implementarán en una versión futura
- La app funciona mejor en móvil que en web

### 🔗 Enlaces

- Repositorio: https://github.com/Puchebcn/fittracker-app
- Supabase: Configurado y funcional
- Expo: Compatible con Expo Go

---

**Estado actual v0.2.1**: Dashboard con balance energético CORREGIDO, cálculos nutricionalmente correctos y alineados con estándares profesionales.