import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Pantalla de Registro
 * Formulario completo para crear cuenta y perfil de usuario
 */
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Cuenta, 2: Perfil

  // Datos de cuenta
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Datos de perfil
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(''); // DD/MM/YYYY
  const [height, setHeight] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');

  const handleNextStep = () => {
    // Validar paso 1
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setStep(2);
  };

  const handleRegister = async () => {
    // Validar paso 2
    if (!name.trim() || !birthDate.trim() || !height.trim() || !startWeight.trim() || !targetWeight.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar y convertir fecha de nacimiento (formato DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert('Error', 'Formato de fecha inválido (usa DD/MM/YYYY)');
      return;
    }

    // Convertir DD/MM/YYYY a YYYY-MM-DD para Supabase
    const [day, month, year] = birthDate.split('/');
    const formattedBirthDate = `${year}-${month}-${day}`;

    // Validar que la fecha sea válida
    const dateObj = new Date(formattedBirthDate);
    if (isNaN(dateObj.getTime())) {
      Alert.alert('Error', 'Fecha inválida');
      return;
    }

    const heightNum = parseFloat(height);
    const startWeightNum = parseFloat(startWeight);
    const targetWeightNum = parseFloat(targetWeight);

    if (heightNum <= 0 || heightNum > 300) {
      Alert.alert('Error', 'Altura inválida (debe estar entre 1 y 300 cm)');
      return;
    }

    if (startWeightNum <= 0 || startWeightNum > 500) {
      Alert.alert('Error', 'Peso inicial inválido');
      return;
    }

    if (targetWeightNum <= 0 || targetWeightNum > 500) {
      Alert.alert('Error', 'Peso objetivo inválido');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email.trim(), password, {
        name: name.trim(),
        birthDate: formattedBirthDate,
        height: Math.round(heightNum),
        startWeight: startWeightNum,
        currentWeight: startWeightNum,
        targetWeight: targetWeightNum,
        activityLevel,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert('Error', 'Este email ya está registrado');
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert(
          '¡Éxito!',
          'Tu cuenta ha sido creada. ¡Bienvenido a FitTracker!',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
      console.error('Error en registro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 1 ? router.back() : setStep(1))}
          >
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>🏋️</Text>
          <Text style={styles.title}>
            {step === 1 ? 'Crear Cuenta' : 'Tu Perfil'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Paso 1 de 2: Datos de acceso' : 'Paso 2 de 2: Información personal'}
          </Text>
        </View>

        {/* Paso 1: Datos de cuenta */}
        {step === 1 && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
              <Text style={styles.nextButtonText}>Continuar →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Paso 2: Datos de perfil */}
        {step === 2 && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY (ej: 15/03/1982)"
                value={birthDate}
                onChangeText={(text) => {
                  // Solo permitir números y /
                  const formatted = text.replace(/[^0-9/]/g, '');
                  setBirthDate(formatted);
                }}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.helpText}>Formato: día/mes/año</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 180"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso Actual (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 104"
                value={startWeight}
                onChangeText={setStartWeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso Objetivo (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 84"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nivel de Actividad</Text>
              <View style={styles.activityButtons}>
                {[
                  { value: 'sedentary', label: 'Sedentario', icon: '🪑' },
                  { value: 'light', label: 'Ligero', icon: '🚶' },
                  { value: 'moderate', label: 'Moderado', icon: '🏃' },
                  { value: 'active', label: 'Activo', icon: '💪' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.activityButton,
                      activityLevel === option.value && styles.activityButtonActive,
                    ]}
                    onPress={() => setActivityLevel(option.value as any)}
                  >
                    <Text style={styles.activityIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.activityLabel,
                        activityLevel === option.value && styles.activityLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Enlace a login */}
        {step === 1 && (
          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLinkButton}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  activityButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  activityIcon: {
    fontSize: 24,
  },
  activityLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLinkButton: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
});