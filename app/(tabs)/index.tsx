// app/(tabs)/index.tsx
// Dashboard principal - VERSIÓN MEJORADA CON BALANCE ENERGÉTICO

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useUserData } from '../../hooks/useUserData';
import { supabase } from '../../lib/supabase';
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateWorkoutBonus,
  calculateAge,
  calculateMacros,
  calculateWeightProgress,
  calculateMacroPercentage,
  formatWeight,
} from '../../lib/calculations';

const { width } = Dimensions.get('window');

/**
 * 🎯 TIPOS DE BALANCE
 */
type BalanceStatus = 'excellent' | 'good' | 'warning' | 'danger';

interface BalanceInfo {
  status: BalanceStatus;
  netCalories: number;
  consumed: number;
  burned: number;
  target: number;
  difference: number;
  emoji: string;
  color: string;
  message: string;
}

export default function DashboardScreen() {
  const { profile, weightHistory, dailyStats, loading, error, refresh } = useUserData();
  const [refreshing, setRefreshing] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleAddWeight = async () => {
    if (!newWeight || !profile) {
      Alert.alert('Error', 'Por favor ingresa un peso válido');
      return;
    }

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Error', 'El peso debe ser un número mayor a 0');
      return;
    }

    setSavingWeight(true);

    try {
      const { error: weightError } = await supabase
        .from('weight_history')
        .insert({
          user_id: profile.id,
          weight: weightValue,
          measured_at: new Date().toISOString(),
        });

      if (weightError) throw weightError;

      const { error: updateError } = await supabase
        .from('users')
        .update({ current_weight: weightValue, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refresh();
      setNewWeight('');
      setShowWeightModal(false);
      Alert.alert('¡Éxito!', 'Peso registrado correctamente');
    } catch (err: any) {
      console.error('Error al guardar peso:', err);
      Alert.alert('Error', 'No se pudo guardar el peso: ' + err.message);
    } finally {
      setSavingWeight(false);
    }
  };

  /**
   * 🔥 CÁLCULO DEL BALANCE ENERGÉTICO
   */
  const balanceInfo = useMemo((): BalanceInfo | null => {
    if (!profile) return null;

    const age = calculateAge(profile.birth_date);
    const bmr = calculateBMR(profile.current_weight, profile.height_cm, age);
    const tdee = calculateTDEE(bmr, profile.activity_level);
    const workoutBonus = calculateWorkoutBonus(dailyStats.workoutCalories);
    const target = calculateDailyCalorieTarget(tdee, 600, workoutBonus);
    
    const consumed = dailyStats.totalCalories;
    const burned = dailyStats.workoutCalories + Math.round(dailyStats.steps * 0.04); // 0.04 kcal por paso
    const netCalories = consumed - burned;
    const difference = netCalories - target;

    let status: BalanceStatus;
    let emoji: string;
    let color: string;
    let message: string;

    // Sistema de semáforo
    if (Math.abs(difference) <= 200) {
      // 🟢 VERDE: Perfecto (-200 a +200 kcal)
      status = 'excellent';
      emoji = '🎯';
      color = '#22c55e';
      message = '¡Perfecto! Estás en tu objetivo';
    } else if (Math.abs(difference) <= 400) {
      // 🟡 AMARILLO: Aceptable (200-400 kcal)
      status = 'good';
      emoji = '👍';
      color = '#f59e0b';
      message = difference > 0 ? 'Ligeramente por encima' : 'Un poco bajo, pero bien';
    } else if (Math.abs(difference) <= 600) {
      // 🟠 NARANJA: Cuidado (400-600 kcal)
      status = 'warning';
      emoji = '⚠️';
      color = '#f97316';
      message = difference > 0 ? 'Cuidado, te estás excediendo' : 'Estás muy bajo, come algo';
    } else {
      // 🔴 ROJO: Peligro (>600 kcal)
      status = 'danger';
      emoji = '🚨';
      color = '#ef4444';
      message = difference > 0 ? '¡Demasiadas calorías!' : '¡Estás comiendo muy poco!';
    }

    return {
      status,
      netCalories,
      consumed,
      burned,
      target,
      difference,
      emoji,
      color,
      message,
    };
  }, [profile, dailyStats]);

  /**
   * 🍽️ MARGEN DISPONIBLE PARA PRÓXIMAS COMIDAS
   */
  const mealMargin = useMemo(() => {
    if (!balanceInfo) return null;

    const remaining = balanceInfo.target - balanceInfo.netCalories;
    
    let suggestion: string;
    let category: 'light' | 'moderate' | 'heavy';
    
    if (remaining < 0) {
      suggestion = 'Ya superaste tu objetivo. Evita más comidas hoy';
      category = 'light';
    } else if (remaining < 300) {
      suggestion = 'Cena ligera: ensalada o proteína magra';
      category = 'light';
    } else if (remaining < 600) {
      suggestion = 'Comida moderada: proteína + verduras + carbohidratos';
      category = 'moderate';
    } else {
      suggestion = 'Puedes comer normalmente';
      category = 'heavy';
    }

    return {
      remaining,
      suggestion,
      category,
    };
  }, [balanceInfo]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (error || !profile || !balanceInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'No se pudo cargar el perfil'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = calculateAge(profile.birth_date);
  const bmr = calculateBMR(profile.current_weight, profile.height_cm, age);
  const tdee = calculateTDEE(bmr, profile.activity_level);
  const workoutBonus = calculateWorkoutBonus(dailyStats.workoutCalories);
  const targetCalories = calculateDailyCalorieTarget(tdee, 600, workoutBonus);
  const macros = calculateMacros(targetCalories, profile.target_weight);
  const weightProgress = calculateWeightProgress(profile.start_weight, profile.current_weight, profile.target_weight);
  const stepsProgress = Math.min((dailyStats.steps / 10000) * 100, 100);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
      }
    >
      {/* Header con progreso de peso */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hola, {profile.name} 👋</Text>
            <Text style={styles.title}>Tu Transformación</Text>
          </View>
          <TouchableOpacity style={styles.weightCard} onPress={() => setShowWeightModal(true)}>
            <Text style={styles.currentWeight}>{formatWeight(profile.current_weight)}</Text>
            <Text style={styles.weightUnit}>kg ✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${weightProgress}%` }]} />
        </View>

        {/* Indicadores de peso */}
        <View style={styles.weightIndicators}>
          <Text style={styles.indicatorText}>{formatWeight(profile.start_weight)}kg</Text>
          <Text style={styles.lostWeight}>-{formatWeight(profile.start_weight - profile.current_weight)}kg</Text>
          <Text style={styles.indicatorText}>{formatWeight(profile.target_weight)}kg</Text>
        </View>

        {/* Tags de calorías */}
        <View style={styles.caloriesTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🔥 {targetCalories} kcal</Text>
          </View>
          {workoutBonus > 0 && (
            <View style={[styles.tag, styles.bonusTag]}>
              <Text style={styles.tagText}>+{workoutBonus} entreno</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* 🆕 BALANCE ENERGÉTICO PRINCIPAL */}
        <View style={[styles.balanceCard, { borderColor: balanceInfo.color }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>⚡ Balance Energético Hoy</Text>
            <Text style={[styles.balanceStatus, { color: balanceInfo.color }]}>
              {balanceInfo.emoji} {balanceInfo.message}
            </Text>
          </View>

          {/* Métricas principales */}
          <View style={styles.balanceMetrics}>
            <View style={styles.balanceMetricItem}>
              <Text style={styles.balanceMetricLabel}>Consumido</Text>
              <Text style={[styles.balanceMetricValue, { color: '#f97316' }]}>
                {Math.round(balanceInfo.consumed)}
              </Text>
              <Text style={styles.balanceMetricUnit}>kcal</Text>
            </View>

            <View style={styles.balanceMetricDivider}>
              <Text style={styles.balanceMetricSign}>-</Text>
            </View>

            <View style={styles.balanceMetricItem}>
              <Text style={styles.balanceMetricLabel}>Quemado</Text>
              <Text style={[styles.balanceMetricValue, { color: '#22c55e' }]}>
                {Math.round(balanceInfo.burned)}
              </Text>
              <Text style={styles.balanceMetricUnit}>kcal</Text>
            </View>

            <View style={styles.balanceMetricDivider}>
              <Text style={styles.balanceMetricSign}>=</Text>
            </View>

            <View style={styles.balanceMetricItem}>
              <Text style={styles.balanceMetricLabel}>Neto</Text>
              <Text style={[styles.balanceMetricValue, { color: balanceInfo.color }]}>
                {Math.round(balanceInfo.netCalories)}
              </Text>
              <Text style={styles.balanceMetricUnit}>kcal</Text>
            </View>
          </View>

          {/* Barra visual del balance */}
          <View style={styles.balanceBarContainer}>
            <View style={styles.balanceBar}>
              <View 
                style={[
                  styles.balanceBarFill, 
                  { 
                    width: `${Math.min((balanceInfo.netCalories / balanceInfo.target) * 100, 100)}%`,
                    backgroundColor: balanceInfo.color 
                  }
                ]} 
              />
              <View style={styles.balanceBarTarget} />
            </View>
            <View style={styles.balanceBarLabels}>
              <Text style={styles.balanceBarLabel}>0</Text>
              <Text style={[styles.balanceBarLabel, { fontWeight: 'bold', color: '#6366f1' }]}>
                Objetivo: {balanceInfo.target}
              </Text>
            </View>
          </View>

          {/* Diferencia con objetivo */}
          <View style={styles.balanceDifference}>
            <Text style={styles.balanceDifferenceLabel}>
              {balanceInfo.difference > 0 ? 'Exceso:' : 'Déficit adicional:'}
            </Text>
            <Text style={[styles.balanceDifferenceValue, { color: balanceInfo.color }]}>
              {Math.abs(Math.round(balanceInfo.difference))} kcal
            </Text>
          </View>
        </View>

        {/* 🆕 WIDGET DE MARGEN DISPONIBLE */}
        {mealMargin && (
          <View style={styles.marginCard}>
            <View style={styles.marginHeader}>
              <Text style={styles.marginTitle}>🍽️ Margen para próximas comidas</Text>
            </View>
            
            <View style={styles.marginContent}>
              <View style={styles.marginValueContainer}>
                <Text style={[
                  styles.marginValue,
                  { color: mealMargin.remaining > 0 ? '#22c55e' : '#ef4444' }
                ]}>
                  {mealMargin.remaining > 0 ? Math.round(mealMargin.remaining) : 0}
                </Text>
                <Text style={styles.marginUnit}>kcal disponibles</Text>
              </View>

              <View style={[
                styles.marginSuggestion,
                {
                  backgroundColor: mealMargin.category === 'light' 
                    ? '#fef3c7' 
                    : mealMargin.category === 'moderate' 
                    ? '#dbeafe' 
                    : '#d1fae5'
                }
              ]}>
                <Text style={styles.marginSuggestionIcon}>
                  {mealMargin.category === 'light' ? '🥗' : mealMargin.category === 'moderate' ? '🍽️' : '🍖'}
                </Text>
                <Text style={styles.marginSuggestionText}>{mealMargin.suggestion}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tarjetas de resumen originales (Pasos) */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>👟 Pasos</Text>
              {stepsProgress >= 100 && (
                <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.statusText, { color: '#16a34a' }]}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.summaryValue}>
              {(dailyStats.steps / 1000).toFixed(1)}k
              <Text style={styles.summaryTarget}>/10k</Text>
            </Text>
            <View style={styles.progressBarSmall}>
              <View
                style={[
                  styles.progressFillSmall,
                  {
                    width: `${stepsProgress}%`,
                    backgroundColor: stepsProgress >= 100 ? '#22c55e' : '#6366f1',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>💧 Hidratación</Text>
            </View>
            <Text style={styles.summaryValue}>
              {dailyStats.waterGlasses}
              <Text style={styles.summaryTarget}>/8</Text>
            </Text>
            <View style={styles.progressBarSmall}>
              <View
                style={[
                  styles.progressFillSmall,
                  {
                    width: `${Math.min((dailyStats.waterGlasses / 8) * 100, 100)}%`,
                    backgroundColor: '#3b82f6',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Macros del día */}
        <View style={styles.macrosCard}>
          <Text style={styles.sectionTitle}>🎯 Macros hoy</Text>
          <View style={styles.macrosContainer}>
            {/* Proteína */}
            <View style={styles.macroItem}>
              <View style={[styles.macroCircle, { borderColor: '#6366f1', borderWidth: 3 }]}>
                <Text style={styles.macroPercentage}>
                  {calculateMacroPercentage(dailyStats.totalProtein, macros.protein)}%
                </Text>
              </View>
              <Text style={styles.macroLabel}>Prot</Text>
              <Text style={styles.macroValue}>
                {Math.round(dailyStats.totalProtein)}/{macros.protein}g
              </Text>
            </View>

            {/* Carbohidratos */}
            <View style={styles.macroItem}>
              <View style={[styles.macroCircle, { borderColor: '#22c55e', borderWidth: 3 }]}>
                <Text style={styles.macroPercentage}>
                  {calculateMacroPercentage(dailyStats.totalCarbs, macros.carbs)}%
                </Text>
              </View>
              <Text style={styles.macroLabel}>Carb</Text>
              <Text style={styles.macroValue}>
                {Math.round(dailyStats.totalCarbs)}/{macros.carbs}g
              </Text>
            </View>

            {/* Grasa */}
            <View style={styles.macroItem}>
              <View style={[styles.macroCircle, { borderColor: '#f59e0b', borderWidth: 3 }]}>
                <Text style={styles.macroPercentage}>
                  {calculateMacroPercentage(dailyStats.totalFat, macros.fat)}%
                </Text>
              </View>
              <Text style={styles.macroLabel}>Gras</Text>
              <Text style={styles.macroValue}>
                {Math.round(dailyStats.totalFat)}/{macros.fat}g
              </Text>
            </View>
          </View>
        </View>

        {/* Objetivos dinámicos */}
        <View style={styles.objectivesCard}>
          <Text style={styles.sectionTitle}>⚙️ Objetivos dinámicos</Text>
          <View style={styles.objectivesGrid}>
            <View style={[styles.objectiveItem, { backgroundColor: '#f9fafb' }]}>
              <Text style={styles.objectiveLabel}>Metabolismo</Text>
              <Text style={styles.objectiveValue}>{bmr} kcal</Text>
            </View>
            <View style={[styles.objectiveItem, { backgroundColor: '#f9fafb' }]}>
              <Text style={styles.objectiveLabel}>Gasto total</Text>
              <Text style={styles.objectiveValue}>{tdee} kcal</Text>
            </View>
            <View style={[styles.objectiveItem, { backgroundColor: '#fee2e2' }]}>
              <Text style={styles.objectiveLabel}>Déficit</Text>
              <Text style={[styles.objectiveValue, { color: '#dc2626' }]}>-600</Text>
            </View>
            <View style={[styles.objectiveItem, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.objectiveLabel}>Objetivo hoy</Text>
              <Text style={[styles.objectiveValue, { color: '#16a34a' }]}>
                {targetCalories} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Historial de peso */}
        <View style={styles.weightHistoryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>⚖️ Evolución peso</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowWeightModal(true)}>
              <Text style={styles.addButtonText}>+ Añadir</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weightHistory.slice(-10).map((entry, index) => (
              <View key={index} style={styles.weightHistoryItem}>
                <Text style={styles.weightHistoryWeight}>{formatWeight(entry.weight)}kg</Text>
                <Text style={styles.weightHistoryDate}>
                  {new Date(entry.measured_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal de peso */}
      <Modal
        visible={showWeightModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWeightModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>⚖️ Registrar peso</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.weightInput}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder={profile.current_weight.toString()}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWeightModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddWeight}
                disabled={savingWeight}
              >
                {savingWeight ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  weightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  currentWeight: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  weightUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  weightIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lostWeight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  caloriesTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bonusTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  tagText: {
    fontSize: 12,
    color: '#ffffff',
  },
  content: {
    padding: 12,
  },
  // 🆕 ESTILOS DEL BALANCE ENERGÉTICO
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
  },
  balanceHeader: {
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  balanceStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  balanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceMetricLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  balanceMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceMetricUnit: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  balanceMetricDivider: {
    width: 20,
    alignItems: 'center',
  },
  balanceMetricSign: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  balanceBarContainer: {
    marginBottom: 16,
  },
  balanceBar: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  balanceBarTarget: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#6366f1',
  },
  balanceBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  balanceBarLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  balanceDifference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  balanceDifferenceLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  balanceDifferenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 🆕 ESTILOS DEL WIDGET DE MARGEN
  marginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  marginHeader: {
    marginBottom: 12,
  },
  marginTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  marginContent: {
    gap: 12,
  },
  marginValueContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  marginValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  marginUnit: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  marginSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  marginSuggestionIcon: {
    fontSize: 24,
  },
  marginSuggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryTarget: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressBarSmall: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 999,
  },
  macrosCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  objectivesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  objectivesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  objectiveItem: {
    width: (width - 56) / 2,
    borderRadius: 8,
    padding: 12,
  },
  objectiveLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  objectiveValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  weightHistoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addButtonText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  weightHistoryItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  weightHistoryWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  weightHistoryDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  weightInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    minWidth: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});