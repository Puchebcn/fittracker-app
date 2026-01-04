import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, Javi 👋</Text>
        <Text style={styles.title}>Tu Transformación</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '10%' }]} />
        </View>
        
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>104kg</Text>
          <Text style={styles.progressTextGreen}>-1.6kg</Text>
          <Text style={styles.progressText}>84kg</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardLeft]}>
            <Text style={styles.cardLabel}>🔥 Calorías</Text>
            <Text style={styles.cardValue}>0/1850</Text>
            <View style={styles.miniProgressBar}>
              <View style={[styles.miniProgressFill, styles.orange, { width: '0%' }]} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>👟 Pasos</Text>
            <Text style={styles.cardValue}>0/10k</Text>
            <View style={styles.miniProgressBar}>
              <View style={[styles.miniProgressFill, styles.indigo, { width: '0%' }]} />
            </View>
          </View>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>¡Bienvenido a FitTracker! 🎉</Text>
          <Text style={styles.welcomeText}>
            Tu app de transformación fitness está lista. Comienza registrando tu primera comida o entrenamiento.
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
    backgroundColor: '#6366f1',
    padding: 16,
    paddingBottom: 24,
  },
  greeting: {
    color: '#e0e7ff',
    fontSize: 14,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    height: 12,
    marginTop: 16,
  },
  progressFill: {
    backgroundColor: '#4ade80',
    height: '100%',
    borderRadius: 9999,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
  },
  progressTextGreen: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 8,
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  miniProgressBar: {
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    height: 8,
    marginTop: 8,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 9999,
  },
  orange: {
    backgroundColor: '#f97316',
  },
  indigo: {
    backgroundColor: '#6366f1',
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#4b5563',
    textAlign: 'center',
  },
});