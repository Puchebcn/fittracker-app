// Test de conexión con Supabase
// Este archivo es solo para verificar que la configuración funciona

import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Probando conexión con Supabase...');
    
    // Intentamos obtener la sesión actual
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión con Supabase exitosa!');
    console.log('📊 Sesión actual:', data.session ? 'Usuario autenticado' : 'Sin usuario');
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}