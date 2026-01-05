import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar el perfil del usuario
 * Obtiene los datos de la tabla users basándose en el usuario autenticado
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birth_date: string;
  height_cm: number;
  start_weight: number;
  current_weight: number;
  target_weight: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data);
    } catch (err: any) {
      console.error('Error al obtener perfil:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No hay usuario autenticado' };

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Actualizar estado local
      if (profile) {
        setProfile({ ...profile, ...updates } as UserProfile);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      return { error: err.message };
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}