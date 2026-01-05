# CHANGELOG - FitTracker App

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

### 🚧 Pendiente de Implementar

#### Funcionalidades
- [ ] Pantalla de Nutrición (registrar comidas)
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

**Estado actual**: Dashboard completamente funcional con datos reales del usuario conectados a Supabase.