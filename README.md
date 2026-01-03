# 🏋️ FitTracker App

App móvil de fitness para iOS y Android.

## 📱 Descripción

Aplicación de tracking fitness personalizada para transformación física:
- 📊 Dashboard con progreso diario/semanal
- 🍽️ Registro de comidas con análisis nutricional
- 💪 Tracking de entrenamientos
- ⚖️ Historial de peso
- 📅 Plan semanal de comidas
- 📖 Recetas personalizadas
- 💡 Sugerencias inteligentes

## 🛠️ Tech Stack

- **Frontend:** React Native + Expo
- **Backend:** Supabase (PostgreSQL + Auth)
- **Lenguaje:** TypeScript
- **Estilos:** NativeWind (Tailwind CSS)

## 📂 Estructura

```
fittracker-app/
├── app/                    # Pantallas (Expo Router)
│   ├── (tabs)/            # Navegación por tabs
│   └── (auth)/            # Pantallas de autenticación
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
├── hooks/                 # Custom hooks
├── stores/                # Estado global (Zustand)
├── types/                 # Tipos TypeScript
└── docs/                  # Documentación
    ├── PROJECT_CONTEXT.md # Especificaciones completas
    ├── CHANGELOG.md       # Registro de progreso
    └── prototype/         # Prototipo React de referencia
```

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/fittracker-app.git
cd fittracker-app

# Instalar dependencias
npm install

# Iniciar desarrollo
npx expo start
```

## 📋 Documentación

- [Especificaciones del proyecto](docs/PROJECT_CONTEXT.md)
- [Changelog / Progreso](docs/CHANGELOG.md)

## 📈 Estado del Proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1. Setup | 🚧 En progreso | Expo + Supabase + Auth |
| 2. Nutrición | ⏳ Pendiente | CRUD comidas |
| 3. Dashboard | ⏳ Pendiente | Gráficos y métricas |
| 4. Entrenos | ⏳ Pendiente | Registro workouts |
| 5. Plan/Recetas | ⏳ Pendiente | Plan semanal |
| 6. Mejoras | ⏳ Pendiente | Sugerencias, notificaciones |
| 7. Publicación | ⏳ Pendiente | App Store / Play Store |

---

*Desarrollado con ❤️ y Claude AI*
