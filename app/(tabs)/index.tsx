// app/(tabs)/index.tsx
// Dashboard principal - VERSIÓN BÁSICA SIN GRÁFICOS

import React, { useState } from 'react';
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (error || !profile) {
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
  const caloriesRemaining = targetCalories - dailyStats.totalCalories;
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
        {/* Tarjetas de resumen */}
        <View style={styles.summaryGrid}>
          {/* Calorías */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>🔥 Calorías</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: caloriesRemaining > 0 ? '#dcfce7' : '#fee2e2' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: caloriesRemaining > 0 ? '#16a34a' : '#dc2626' },
                  ]}
                >
                  {caloriesRemaining > 0
                    ? `${Math.round(caloriesRemaining)} rest`
                    : `${Math.round(-caloriesRemaining)} exc`}
                </Text>
              </View>
            </View>
            <Text style={styles.summaryValue}>
              {Math.round(dailyStats.totalCalories)}
              <Text style={styles.summaryTarget}>/{targetCalories}</Text>
            </Text>
            <View style={styles.progressBarSmall}>
              <View
                style={[
                  styles.progressFillSmall,
                  {
                    width: `${Math.min((dailyStats.totalCalories / targetCalories) * 100, 100)}%`,
                    backgroundColor: dailyStats.totalCalories > targetCalories ? '#ef4444' : '#f97316',
                  },
                ]}
              />
            </View>
          </View>

          {/* Pasos */}
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
            <View style={[styles.objectiveItem, { backgroundColor: '#f3f4f6' }]}>
              <Text style={styles.objectiveLabel}>Metabolismo</Text>
              <Text style={styles.objectiveValue}>{bmr} kcal</Text>
            </View>
            <View style={[styles.objectiveItem, { backgroundColor: '#f3f4f6' }]}>
              <Text style={styles.objectiveLabel}>Gasto total</Text>
              <Text style={styles.objectiveValue}>{tdee} kcal</Text>
            </View>
            <View style={[styles.objectiveItem, { backgroundColor: '#fef2f2' }]}>
              <Text style={styles.objectiveLabel}>Déficit</Text>
              <Text style={[styles.objectiveValue, { color: '#dc2626' }]}>-600</Text>
            </View>
            <View style={[styles.objectiveItem, { backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.objectiveLabel}>Objetivo hoy</Text>
              <Text style={[styles.objectiveValue, { color: '#16a34a' }]}>
                {targetCalories} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Historial de peso */}
        {weightHistory.length > 0 && (
          <View style={styles.weightHistoryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>⚖️ Historial de peso</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowWeightModal(true)}>
                <Text style={styles.addButtonText}>+ Añadir</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weightHistory.slice(-10).reverse().map((entry) => {
                const date = new Date(entry.measured_at);
                return (
                  <View key={entry.id} style={styles.weightHistoryItem}>
                    <Text style={styles.weightHistoryWeight}>
                      {formatWeight(entry.weight)}
                    </Text>
                    <Text style={styles.weightHistoryDate}>
                      {date.getDate()}/{date.getMonth() + 1}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Hidratación */}
        <View style={styles.hydrationCard}>
          <Text style={styles.sectionTitle}>💧 Hidratación</Text>
          <View style={styles.hydrationContent}>
            <Text style={styles.hydrationValue}>{dailyStats.waterGlasses}</Text>
            <Text style={styles.hydrationLabel}>vasos de agua hoy</Text>
          </View>
        </View>
      </View>

      {/* Modal para añadir peso */}
      <Modal
        visible={showWeightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚖️ Registrar peso</Text>
            
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.weightInput}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder={profile.current_weight.toString()}
                keyboardType="decimal-pad"
                maxLength={6}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowWeightModal(false);
                  setNewWeight('');
                }}
                disabled={savingWeight}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddWeight}
                disabled={savingWeight || !newWeight}
              >
                {savingWeight ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
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
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: '#c7d2fe',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
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
    color: '#c7d2fe',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  weightIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  indicatorText: {
    fontSize: 12,
    color: '#ffffff',
  },
  lostWeight: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#86efac',
  },
  caloriesTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
    marginBottom: 12,
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
  hydrationCard: {
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
  hydrationContent: {
    alignItems: 'center',
  },
  hydrationValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  hydrationLabel: {
    fontSize: 14,
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