import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Colors from '../../constants/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Informe seu nome';
    if (!form.email.trim()) newErrors.email = 'Informe o e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.phone.trim()) newErrors.phone = 'Informe o telefone';
    else if (form.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
    if (!form.password) newErrors.password = 'Informe a senha';
    else if (form.password.length < 6) newErrors.password = 'Mínimo de 6 caracteres';
    if (form.confirm !== form.password) newErrors.confirm = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
    } catch (err) {
      Alert.alert('Erro ao cadastrar', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.logo}>🌿</Text>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Preencha os dados abaixo para começar</Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Nome completo"
              value={form.name}
              onChangeText={v => update('name', v)}
              placeholder="Seu nome"
              autoCapitalize="words"
              error={errors.name}
            />
            <Input
              label="E-mail"
              value={form.email}
              onChangeText={v => update('email', v)}
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChangeText={v => update('phone', v)}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={errors.phone}
            />
            <Input
              label="Senha"
              value={form.password}
              onChangeText={v => update('password', v)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={errors.password}
            />
            <Input
              label="Confirmar senha"
              value={form.confirm}
              onChangeText={v => update('confirm', v)}
              placeholder="Repita a senha"
              secureTextEntry
              error={errors.confirm}
            />

            <Button
              title="Criar conta"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  backButton: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  logo: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textDark },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  registerButton: { marginTop: 8 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: Colors.textLight, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
