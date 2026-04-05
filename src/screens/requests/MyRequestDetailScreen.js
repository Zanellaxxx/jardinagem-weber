import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';

const STATUS_CONFIG = {
  pending: { label: 'Aguardando orçamento', color: '#F9A825', bg: '#FFF8E1', icon: '⏳' },
  quoted: { label: 'Orçamento recebido', color: '#1565C0', bg: '#E3F2FD', icon: '💰' },
  confirmed: { label: 'Confirmado', color: Colors.success, bg: '#E8F5E9', icon: '✅' },
  rejected: { label: 'Recusado', color: Colors.error, bg: '#FFEBEE', icon: '❌' },
};

export default function MyRequestDetailScreen({ route, navigation }) {
  const { request } = route.params;

  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const date = new Date(request.scheduledDate);
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

  const fullAddress = [
    `${request.address.street}, ${request.address.number}`,
    request.address.complement,
    request.address.neighborhood,
    request.address.city,
  ]
    .filter(Boolean)
    .join(' — ');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Status */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <Text style={styles.statusIcon}>{status.icon}</Text>
          <View>
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            {request.status === 'pending' && (
              <Text style={styles.statusHint}>Nossa equipe está analisando sua solicitação</Text>
            )}
            {request.status === 'quoted' && (
              <Text style={styles.statusHint}>Veja o orçamento abaixo</Text>
            )}
            {request.status === 'confirmed' && (
              <Text style={styles.statusHint}>Seu agendamento está confirmado!</Text>
            )}
            {request.status === 'rejected' && (
              <Text style={styles.statusHint}>Esta solicitação foi recusada</Text>
            )}
          </View>
        </View>

        {/* Orçamento recebido */}
        {(request.status === 'quoted' || request.status === 'confirmed') &&
          request.quotedValue && (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteTitle}>Orçamento da Jardinagem Weber</Text>
              <Text style={styles.quoteValue}>{request.quotedValue}</Text>
              {request.adminResponse ? (
                <Text style={styles.quoteMessage}>{request.adminResponse}</Text>
              ) : null}
            </View>
          )}

        {/* Serviço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Serviço</Text>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceIcon}>{request.serviceIcon}</Text>
            <Text style={styles.serviceName}>{request.serviceName}</Text>
          </View>
        </View>

        {/* Data */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Data e horário solicitados</Text>
          <Text style={styles.cardValue}>📅  {formattedDate}</Text>
          <Text style={[styles.cardValue, { marginTop: 6 }]}>🕐  {formattedTime}</Text>
        </View>

        {/* Endereço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Localização</Text>
          <Text style={styles.cardValue}>📍  {fullAddress}</Text>
        </View>

        {/* Observações */}
        {request.observations?.trim() !== '' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Suas observações</Text>
            <Text style={styles.cardValue}>{request.observations}</Text>
          </View>
        )}

        {/* Fotos */}
        {request.photos?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Fotos enviadas ({request.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {request.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  backButton: { paddingTop: 16, paddingBottom: 12 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  statusIcon: { fontSize: 32 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusHint: { fontSize: 13, color: Colors.textMedium, marginTop: 3 },
  quoteCard: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  quoteTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  quoteValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  quoteMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardValue: { fontSize: 14, color: Colors.textDark, lineHeight: 22 },
  serviceRow: { flexDirection: 'row', alignItems: 'center' },
  serviceIcon: { fontSize: 26, marginRight: 12 },
  serviceName: { fontSize: 17, fontWeight: '600', color: Colors.textDark },
  photo: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
});
