import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Colors from '../../constants/colors';

export default function LocationScreen({ route, navigation }) {
  const { service, scheduledDate, observations } = route.params;

  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [complement, setComplement] = useState('');
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!street.trim()) e.street = 'Informe a rua';
    if (!number.trim()) e.number = 'Informe o número';
    if (!neighborhood.trim()) e.neighborhood = 'Informe o bairro';
    if (!city.trim()) e.city = 'Informe a cidade';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    const address = {
      street: street.trim(),
      number: number.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      complement: complement.trim(),
    };
    navigation.navigate('PhotosScreen', {
      service,
      scheduledDate,
      observations,
      address,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Localização</Text>
        <Text style={styles.subtitle}>Onde o serviço será realizado?</Text>

        <View style={styles.row}>
          <View style={styles.flex3}>
            <Input
              label="Rua / Avenida"
              value={street}
              onChangeText={setStreet}
              placeholder="Ex: Rua das Flores"
              error={errors.street}
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Número"
              value={number}
              onChangeText={setNumber}
              placeholder="123"
              keyboardType="numeric"
              error={errors.number}
            />
          </View>
        </View>

        <Input
          label="Bairro"
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder="Ex: Jardim América"
          error={errors.neighborhood}
        />

        <Input
          label="Cidade"
          value={city}
          onChangeText={setCity}
          placeholder="Ex: São Paulo - SP"
          error={errors.city}
        />

        <Input
          label="Complemento (opcional)"
          value={complement}
          onChangeText={setComplement}
          placeholder="Ex: Casa dos fundos, portão azul..."
        />

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            📍 Quanto mais detalhado o endereço, mais fácil para nossa equipe te encontrar.
          </Text>
        </View>

        <Button
          title="Avançar — Fotos"
          onPress={handleNext}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  backButton: { paddingTop: 16, paddingBottom: 8 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textDark, marginBottom: 4, marginTop: 8 },
  subtitle: { fontSize: 16, color: Colors.textMedium, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  flex3: { flex: 3 },
  flex1: { flex: 1 },
  tip: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  tipText: { fontSize: 13, color: Colors.primaryDark, lineHeight: 20 },
  button: { marginTop: 16 },
});
