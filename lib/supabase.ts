import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtenemos las variables de entorno
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Validamos que existan las credenciales
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las credenciales de Supabase. Asegúrate de tener EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Creamos el cliente de Supabase con configuración para React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usamos AsyncStorage para persistir la sesión
    storage: AsyncStorage,
    // Configuración adicional para React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});