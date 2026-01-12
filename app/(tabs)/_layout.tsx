// app/(tabs)/_layout.tsx
// Layout de navegación por tabs - 4 pestañas limpias

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      {/* DASHBOARD - Resumen del día */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* NUTRICIÓN - Registro de comidas */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Comida',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      {/* ENTRENAMIENTOS - Workouts */}
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />

      {/* PERFIL - Configuración y progreso */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* OCULTAR PLAN - Ya no se usa */}
      <Tabs.Screen
        name="plan"
        options={{
          href: null, // Esto oculta el tab
        }}
      />

      {/* OCULTAR TEST - Ya no se usa */}
      <Tabs.Screen
        name="test"
        options={{
          href: null, // Esto oculta el tab
        }}
      />
    </Tabs>
  );
}