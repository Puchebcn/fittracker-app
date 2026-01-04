import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comidas</Text>
        <Text style={styles.subtitle}>Registra tu alimentación del día</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Objetivo</Text>
              <Text style={styles.summaryValue}>1850</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Consumido</Text>
              <Text style={[styles.summaryValue, styles.orange]}>0</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Restante</Text>
              <Text style={[styles.summaryValue, styles.green]}>1850</Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <Text style={styles.emojiText}>🍽️</Text>
          <Text style={styles.emptyText}>
            Próximamente podrás registrar tus comidas aquí
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  orange: {
    color: '#f97316',
  },
  green: {
    color: '#22c55e',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
  },
});