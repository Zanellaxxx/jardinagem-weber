import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setRequested(true);
      Alert.alert('Código enviado', 'Enviamos um código temporário para o e-mail informado.');
    } catch (error) {
      Alert.alert('Não foi possível recuperar', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (password !== confirm) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, code, password });
      Alert.alert('Senha alterada', 'Entre usando sua nova senha.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Não foi possível alterar', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            Informe o e-mail cadastrado para gerar um código temporário.
          </Text>
          <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
          {!requested ? (
            <Button title="Gerar código" onPress={requestCode} loading={loading} />
          ) : (
            <>
              <Input label="Código temporário" value={code} onChangeText={setCode} keyboardType="numeric" />
              <Input label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry />
              <Input label="Confirmar nova senha" value={confirm} onChangeText={setConfirm} secureTextEntry />
              <Button title="Alterar senha" onPress={changePassword} loading={loading} />
              <Button title="Gerar novo código" onPress={requestCode} variant="outline" style={styles.secondary} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 24 },
  backButton: { marginBottom: 28 },
  backText: { color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textDark },
  subtitle: { fontSize: 14, color: Colors.textMedium, lineHeight: 21, marginTop: 8, marginBottom: 28 },
  secondary: { marginTop: 12 },
});
