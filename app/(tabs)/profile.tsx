import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Configuración y ajustes</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={styles.name}>Javi</Text>
            <Text style={styles.info}>42 años • 180cm</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Peso inicial</Text>
            <Text style={styles.statsValue}>104 kg</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Peso actual</Text>
            <Text style={[styles.statsValue, styles.indigo]}>102.4 kg</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Objetivo</Text>
            <Text style={[styles.statsValue, styles.green]}>84 kg</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AJUSTES</Text>
          <Text style={styles.menuItem}>⚙️ Configuración</Text>
          <Text style={[styles.menuItem, styles.borderTop]}>📊 Estadísticas</Text>
          <Text style={[styles.menuItem, styles.borderTop]}>ℹ️ Acerca de</Text>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#e0e7ff',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  info: {
    color: '#6b7280',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsLabel: {
    color: '#6b7280',
  },
  statsValue: {
    fontWeight: 'bold',
  },
  indigo: {
    color: '#6366f1',
  },
  green: {
    color: '#22c55e',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
  },
  menuItem: {
    color: '#6b7280',
    paddingVertical: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});