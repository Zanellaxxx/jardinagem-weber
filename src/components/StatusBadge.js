import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getStatusConfig } from '../constants/requestStatus';

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});

