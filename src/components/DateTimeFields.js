import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '../constants/colors';

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatDateInput(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatTimeInput(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function updateDateFromInput(currentDate, value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const formatted = [day, month, year].filter(Boolean).join('/');

  if (digits.length !== 8) return { date: currentDate, value: formatted };

  const parsed = new Date(Number(year), Number(month) - 1, Number(day), currentDate.getHours(), currentDate.getMinutes(), 0, 0);
  const valid = parsed.getFullYear() === Number(year)
    && parsed.getMonth() === Number(month) - 1
    && parsed.getDate() === Number(day);

  return { date: valid ? parsed : currentDate, value: formatted };
}

export function updateTimeFromInput(currentDate, value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  const hours = digits.slice(0, 2);
  const minutes = digits.slice(2, 4);
  const formatted = [hours, minutes].filter(Boolean).join(':');

  if (digits.length !== 4) return { date: currentDate, value: formatted };

  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  const valid = parsedHours >= 0 && parsedHours <= 23 && parsedMinutes >= 0 && parsedMinutes <= 59;
  if (!valid) return { date: currentDate, value: formatted };

  const parsed = new Date(currentDate);
  parsed.setHours(parsedHours, parsedMinutes, 0, 0);
  return { date: parsed, value: formatted };
}

export default function DateTimeFields({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateLabel = 'Data',
  timeLabel = 'Horário',
}) {
  return (
    <View style={styles.grid}>
      <View style={styles.field}>
        <Text style={styles.label}>{dateLabel}</Text>
        <TextInput
          style={styles.input}
          value={dateValue}
          onChangeText={onDateChange}
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{timeLabel}</Text>
        <TextInput
          style={styles.input}
          value={timeValue}
          onChangeText={onTimeChange}
          placeholder="HH:MM"
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: Colors.textMedium,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    color: Colors.textDark,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
});
