# 📋 Instrucciones del Proyecto - FitTracker

## 🔗 Repositorio GitHub
**URL:** https://github.com/TU_USUARIO/fittracker-app

*(Actualiza TU_USUARIO con tu nombre de usuario real)*

## 📁 Estructura de Documentación

El proyecto tiene su documentación en el repositorio:
- `docs/PROJECT_CONTEXT.md` - Especificaciones completas
- `docs/CHANGELOG.md` - Progreso y decisiones
- `docs/prototype/fitness_v2.jsx` - Prototipo de referencia

## 🎯 Objetivo del Proyecto

Desarrollar una app móvil (iOS/Android) de fitness usando:
- React Native + Expo
- Supabase (base de datos y auth)
- TypeScript
- NativeWind

## 👤 Contexto del Usuario

- **Nombre:** Javi
- **Objetivo:** Perder peso (104kg → 84kg en 6 meses)
- **Experiencia técnica:** PowerApps, React, SharePoint
- **Hija:** Vega (5 meses) - relevante para cardio "Paseo con Vega"

## ✅ Preferencias de Desarrollo

1. **Código limpio** con TypeScript estricto
2. **Componentes reutilizables** y bien organizados
3. **Comentarios en español**
4. **Explicaciones paso a paso** de cada implementación
5. **Commits pequeños** y descriptivos

## 🔄 Flujo de Trabajo

1. Al inicio de cada sesión, si necesito ver el código actual:
   - Proporcionar URL del archivo en GitHub, o
   - Pegar el contenido del archivo relevante

2. Para cambios en el código:
   - Claude propone el código
   - Javi lo implementa en su repo local
   - Commit y push a GitHub

3. Actualizar `CHANGELOG.md` con cada avance significativo

## 📝 Formato de Respuestas

Cuando Claude genere código:
- Indicar la ruta del archivo: `/app/(tabs)/index.tsx`
- Código completo (no parcial) cuando sea archivo nuevo
- Para ediciones, indicar qué sección modificar
- Explicar brevemente qué hace cada parte

## ⚠️ Recordatorios

- El prototipo `fitness_v2.jsx` es REFERENCIA, no copiar directamente
- Siempre usar TypeScript, no JavaScript plano
- Seguir convenciones de Expo Router para navegación
- Supabase para TODO lo de backend (no Firebase, no API custom)
