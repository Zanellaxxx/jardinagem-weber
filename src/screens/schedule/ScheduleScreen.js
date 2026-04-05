import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Colors from '../../constants/colors';

export default function ScheduleScreen({ route, navigation }) {
  const { service } = route.params;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const [date, setDate] = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [observations, setObservations] = useState('');

  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  function onDateChange(event, selected) {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const updated = new Date(selected);
      updated.setHours(date.getHours(), date.getMinutes());
      setDate(updated);
    }
  }

  function onTimeChange(event, selected) {
    setShowTimePicker(Platform.OS === 'ios');
    if (selected) {
      const updated = new Date(date);
      updated.setHours(selected.getHours(), selected.getMinutes());
      setDate(updated);
    }
  }

  function handleNext() {
    navigation.navigate('LocationScreen', {
      service,
      scheduledDate: date.toISOString(),
      observations,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Agendamento</Text>
        <Text style={styles.subtitle}>{service.icon}  {service.name}</Text>

        {/* Data */}
        <Text style={styles.sectionLabel}>Data preferida</Text>
        <TouchableOpacity style={styles.pickerRow} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.pickerIcon}>📅</Text>
          <Text style={styles.pickerText}>{formattedDate}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {/* Horário */}
        <Text style={styles.sectionLabel}>Horário preferido</Text>
        <TouchableOpacity style={styles.pickerRow} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.pickerIcon}>🕐</Text>
          <Text style={styles.pickerText}>{formattedTime}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        {/* Observações */}
        <Text style={styles.sectionLabel}>Observações (opcional)</Text>
        <TextInput
          style={styles.textArea}
          value={observations}
          onChangeText={setObservations}
          placeholder="Descreva detalhes importantes do serviço desejado..."
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Button
          title="Avançar — Localização"
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
  subtitle: { fontSize: 16, color: Colors.textMedium, marginBottom: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMedium,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerIcon: { fontSize: 20, marginRight: 12 },
  pickerText: { fontSize: 15, color: Colors.textDark, flex: 1 },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textDark,
    minHeight: 100,
  },
  button: { marginTop: 28 },
});
