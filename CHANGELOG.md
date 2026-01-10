# CHANGELOG - FitTracker App

## [0.2.0] - Dashboard Mejorado con Balance Energético - 2025-01-10

### 🎯 Nuevas Funcionalidades

#### Balance Energético Completo
- **Card principal de balance** que muestra:
  - Calorías consumidas (de las comidas)
  - Calorías quemadas (entrenamientos + pasos estimados)
  - Balance neto (consumido - quemado)
  - Comparación con objetivo del día
  - Diferencia con el objetivo (exceso o déficit adicional)

#### Sistema de Semáforo
- **Estado del balance con 4 niveles**:
  - 🟢 **Excelente** (±200 kcal): "¡Perfecto! Estás en tu objetivo"
  - 🟡 **Bueno** (200-400 kcal): "Ligeramente por encima/debajo"
  - 🟠 **Advertencia** (400-600 kcal): "Cuidado, te estás excediendo/muy bajo"
  - 🔴 **Peligro** (>600 kcal): "¡Demasiadas calorías!/¡Muy poco!"
- Código de colores dinámico según el estado
- Emoji y mensaje personalizado para cada nivel

#### Widget de Margen Disponible
- **Muestra calorías disponibles** para próximas comidas
- **Sugerencias inteligentes**:
  - < 0 kcal: "Ya superaste tu objetivo. Evita más comidas hoy"
  - < 300 kcal: "Cena ligera: ensalada o proteína magra"
  - < 600 kcal: "Comida moderada: proteína + verduras + carbohidratos"
  - > 600 kcal: "Puedes comer normalmente"
- **Categorización visual** (ligera/moderada/completa)
- Iconos según tipo de comida recomendada

#### Cálculo de Calorías Quemadas
- **Entrenamientos**: Calorías registradas manualmente
- **Pasos**: Estimación automática (0.04 kcal por paso)
- **Total combinado** para cálculo del balance

#### Mejoras Visuales
- Barra de progreso mejorada con indicador de objetivo
- Métricas presentadas de forma más clara (Consumido - Quemado = Neto)
- Bordes de colores dinámicos según estado del balance
- Card de hidratación movido junto a pasos

### ⚙️ Mejoras Técnicas

#### Lógica de Balance
```typescript
// Fórmula del balance neto
netCalories = consumed - (workoutCalories + stepsCalories)
difference = netCalories - target

// Calorías por pasos
stepsCalories = steps * 0.04
```

#### Tipos TypeScript
- `BalanceStatus`: 'excellent' | 'good' | 'warning' | 'danger'
- `BalanceInfo`: Interface completa para el balance energético
- Tipado estricto en todos los cálculos

### 📊 Métricas Implementadas

**Balance Energético:**
- Consumido: Suma de calorías de todas las comidas del día
- Quemado entrenos: Calorías de workouts registrados
- Quemado pasos: steps × 0.04 kcal
- Total quemado: entrenamientos + pasos
- Neto: consumido - total quemado
- Diferencia: neto - objetivo

**Margen Disponible:**
- Restante = objetivo - neto
- Categorías: ligera (<300), moderada (300-600), completa (>600)

### 🎨 Experiencia de Usuario

#### Feedback Visual Inmediato
- El usuario ve al instante si va bien o mal en su día
- Colores intuitivos (verde = bien, rojo = mal)
- Mensajes claros y accionables

#### Información Contextual
- No solo números, sino sugerencias prácticas
- Ayuda a tomar decisiones sobre próximas comidas
- Motivación positiva cuando va bien

#### Diseño Limpio
- Cards bien organizadas por prioridad
- Balance energético como protagonista
- Información secundaria accesible pero no invasiva

### ðŸ› ï¸ Cambios en la Estructura

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

### 📝 Próximas Mejoras Planificadas

#### Funcionalidades Pendientes
- [ ] Historial semanal de balance (gráfico de tendencia)
- [ ] Predictor de peso basado en balance
- [ ] Sistema de rachas (días consecutivos en objetivo)
- [ ] Notificaciones inteligentes según balance
- [ ] Comparador de opciones para compensar excesos

#### Pantallas por Implementar
- [ ] Pantalla de Entrenamientos (registrar y ver detalles)
- [ ] Pantalla de Plan Semanal (planificación de comidas)
- [ ] Pantalla de Perfil completa

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
  - `foods`: Catálogo de alimentos (43 precargados)
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

- **43 alimentos precargados** en 9 categorías:
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
- React Native con Expo SDK 52
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
  "@supabase/supabase-js": "^2.39.0",
  "@react-native-async-storage/async-storage": "1.23.1",
  "react-native-url-polyfill": "^2.0.0",
  "expo": "~52.0.11",
  "expo-router": "~4.0.9"
}
```

### 💤 Usuario de Prueba

```
Nombre: Javi
Edad: 42 años
Altura: 180 cm
Peso inicial: 104 kg
Peso objetivo: 84 kg
Nivel actividad: Moderado
```

### 🛠 Problemas Conocidos

- ~~react-native-chart-kit causa errores de TypeScript~~ ✅ RESUELTO: Removido temporalmente
- Los gráficos se implementarán en una versión futura
- La app funciona mejor en móvil que en web

### 🔗 Enlaces

- Repositorio: https://github.com/Puchebcn/fittracker-app
- Supabase: Configurado y funcional
- Expo: Compatible con Expo Go

---

**Estado actual**: Dashboard mejorado con sistema completo de balance energético, semáforo de estado y widgets inteligentes.
