import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Contexto de Autenticación
 * Gestiona el estado de autenticación del usuario en toda la app
 */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

interface UserData {
  name: string;
  birthDate: string; // formato: YYYY-MM-DD
  height: number;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Registrar nuevo usuario
   * Crea la cuenta en auth.users y el perfil en public.users
   */
  const signUp = async (email: string, password: string, userData: UserData) => {
    try {
      console.log('🔵 Iniciando registro...');
      console.log('Email:', email);
      console.log('Datos usuario:', userData);

      // 1. Crear usuario en auth.users
      console.log('🔵 Paso 1: Creando usuario en auth.users...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Error en auth.signUp:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('❌ No se obtuvo el usuario después de signUp');
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ Usuario creado en auth.users:', authData.user.id);

      // 2. Crear perfil en public.users
      console.log('🔵 Paso 2: Creando perfil en public.users...');
      const profileData = {
        id: authData.user.id,
        email: email,
        name: userData.name,
        birth_date: userData.birthDate,
        height_cm: userData.height,
        start_weight: userData.startWeight,
        current_weight: userData.currentWeight,
        target_weight: userData.targetWeight,
        activity_level: userData.activityLevel,
      };

      console.log('Datos del perfil:', profileData);

      const { error: profileError } = await supabase.from('users').insert(profileData);

      if (profileError) {
        console.error('❌ Error al crear perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil creado en public.users');

      // 3. Crear entrada inicial en weight_history
      console.log('🔵 Paso 3: Creando entrada en weight_history...');
      const { error: weightError } = await supabase.from('weight_history').insert({
        user_id: authData.user.id,
        weight: userData.startWeight,
        measured_at: new Date().toISOString(),
        notes: 'Peso inicial',
      });

      if (weightError) {
        console.warn('⚠️ No se pudo crear el historial de peso inicial:', weightError);
      } else {
        console.log('✅ Entrada en weight_history creada');
      }

      console.log('🎉 Registro completado exitosamente');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error general en signUp:', error);
      return { error };
    }
  };

  /**
   * Iniciar sesión
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error en signIn:', error);
      return { error };
    }
  };

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error en signOut:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
