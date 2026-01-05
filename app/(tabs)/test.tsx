import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';

/**
 * Pantalla de prueba de conexión con Supabase
 * Ruta: app/(tabs)/test.tsx
 */
export default function TestScreen() {
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [foodsCount, setFoodsCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Verificar sesión
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Error de sesión: ${sessionError.message}`);
      }
      
      setSession(sessionData.session);

      // 2. Intentar obtener alimentos de la base de datos
      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select('id, name, category')
        .eq('is_custom', false)
        .limit(5);

      if (foodsError) {
        throw new Error(`Error BD: ${foodsError.message}`);
      }

      // 3. Contar total de alimentos
      const { count, error: countError } = await supabase
        .from('foods')
        .select('*', { count: 'exact', head: true })
        .eq('is_custom', false);

      if (countError) {
        throw new Error(`Error al contar: ${countError.message}`);
      }

      setFoodsCount(count || 0);
      setConnectionStatus('success');

    } catch (err: any) {
      console.error('Error en test de conexión:', err);
      setError(err.message);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🧪 Test de Conexión Supabase</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Verificando conexión...</Text>
          </View>
        ) : (
          <>
            {/* Estado de conexión */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Estado:</Text>
              <View style={[
                styles.statusBadge,
                connectionStatus === 'success' && styles.statusSuccess,
                connectionStatus === 'error' && styles.statusError,
              ]}>
                <Text style={styles.statusText}>
                  {connectionStatus === 'success' ? '✅ Conectado' : '❌ Error'}
                </Text>
              </View>
            </View>

            {/* Información de sesión */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Sesión:</Text>
              <Text style={styles.infoValue}>
                {session ? '🔐 Usuario autenticado' : '👤 Sin autenticar'}
              </Text>
            </View>

            {/* Alimentos en BD */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Alimentos en BD:</Text>
              <Text style={styles.infoValue}>
                {connectionStatus === 'success' ? `🍎 ${foodsCount} alimentos` : 'N/A'}
              </Text>
            </View>

            {/* URL del proyecto */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Proyecto:</Text>
              <Text style={styles.infoValueSmall}>
                {process.env.EXPO_PUBLIC_SUPABASE_URL?.replace('https://', '')}
              </Text>
            </View>

            {/* Mensaje de error si existe */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>❌ Error:</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Mensaje de éxito */}
            {connectionStatus === 'success' && !error && (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>🎉 ¡Perfecto!</Text>
                <Text style={styles.successMessage}>
                  La conexión con Supabase funciona correctamente.
                  {'\n'}La base de datos tiene {foodsCount} alimentos.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  statusSuccess: {
    backgroundColor: '#d1fae5',
  },
  statusError: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  infoValueSmall: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#7f1d1d',
  },
  successContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 12,
    color: '#14532d',
    lineHeight: 18,
  },
});
