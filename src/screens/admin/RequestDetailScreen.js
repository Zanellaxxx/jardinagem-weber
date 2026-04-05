import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Colors from '../../constants/colors';
import { useRequests } from '../../context/RequestsContext';

const STATUS_CONFIG = {
  pending: { label: 'Aguardando resposta', color: '#F9A825', bg: '#FFF8E1' },
  quoted: { label: 'Orçamento enviado', color: '#1565C0', bg: '#E3F2FD' },
  confirmed: { label: 'Confirmado', color: Colors.success, bg: '#E8F5E9' },
  rejected: { label: 'Recusado', color: Colors.error, bg: '#FFEBEE' },
};

export default function RequestDetailScreen({ route, navigation }) {
  const { request } = route.params;
  const { updateRequest } = useRequests();

  const [quotedValue, setQuotedValue] = useState(request.quotedValue || '');
  const [adminResponse, setAdminResponse] = useState(request.adminResponse || '');
  const [loading, setLoading] = useState(false);

  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const date = new Date(request.scheduledDate);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const fullAddress = [
    `${request.address.street}, ${request.address.number}`,
    request.address.complement,
    request.address.neighborhood,
    request.address.city,
  ]
    .filter(Boolean)
    .join(' — ');

  async function handleSendQuote() {
    if (!quotedValue.trim()) {
      Alert.alert('Atenção', 'Informe o valor do orçamento.');
      return;
    }
    setLoading(true);
    try {
      await updateRequest(request.id, {
        status: 'quoted',
        quotedValue: quotedValue.trim(),
        adminResponse: adminResponse.trim(),
      });
      Alert.alert('Orçamento enviado!', 'O orçamento foi registrado com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await updateRequest(request.id, { status: 'confirmed' });
      Alert.alert('Confirmado!', 'Agendamento confirmado com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    Alert.alert('Recusar solicitação', 'Tem certeza que deseja recusar esta solicitação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await updateRequest(request.id, { status: 'rejected' });
            navigation.goBack();
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Solicitação</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Serviço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Serviço solicitado</Text>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceIcon}>{request.serviceIcon}</Text>
            <Text style={styles.serviceName}>{request.serviceName}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Cliente</Text>
          <Text style={styles.cardValue}>👤  {request.userName}</Text>
          <Text style={styles.cardValue}>✉️  {request.userEmail}</Text>
          {request.userPhone && <Text style={styles.cardValue}>📞  {request.userPhone}</Text>}
        </View>

        {/* Data */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Data e horário</Text>
          <Text style={styles.cardValue}>📅  {formattedDate}</Text>
          <Text style={styles.cardValue}>🕐  {formattedTime}</Text>
        </View>

        {/* Endereço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Localização</Text>
          <Text style={styles.cardValue}>📍  {fullAddress}</Text>
        </View>

        {/* Observações */}
        {request.observations?.trim() !== '' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Observações do cliente</Text>
            <Text style={styles.cardValue}>{request.observations}</Text>
          </View>
        )}

        {/* Fotos */}
        {request.photos?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Fotos ({request.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {request.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Ações do admin */}
        {request.status === 'pending' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Enviar orçamento</Text>
            <TextInput
              style={styles.input}
              value={quotedValue}
              onChangeText={setQuotedValue}
              placeholder="Valor (ex: R$ 250,00)"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={adminResponse}
              onChangeText={setAdminResponse}
              placeholder="Mensagem para o cliente (opcional)..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Button
              title="Enviar Orçamento"
              onPress={handleSendQuote}
              loading={loading}
              style={{ marginTop: 4 }}
            />
            <Button
              title="Recusar Solicitação"
              onPress={handleReject}
              variant="outline"
              style={{ marginTop: 10 }}
            />
          </View>
        )}

        {request.status === 'quoted' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Orçamento enviado</Text>
            <Text style={styles.quoteValue}>{request.quotedValue}</Text>
            {request.adminResponse ? (
              <Text style={styles.cardValue}>{request.adminResponse}</Text>
            ) : null}
            <Button
              title="Confirmar Agendamento"
              onPress={handleConfirm}
              loading={loading}
              style={{ marginTop: 14 }}
            />
            <Button
              title="Recusar"
              onPress={handleReject}
              variant="outline"
              style={{ marginTop: 10 }}
            />
          </View>
        )}

        {(request.status === 'confirmed' || request.status === 'rejected') && (
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Text style={styles.finalIcon}>
              {request.status === 'confirmed' ? '✅' : '❌'}
            </Text>
            <Text style={styles.finalText}>
              {request.status === 'confirmed'
                ? 'Agendamento confirmado'
                : 'Solicitação recusada'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  backButton: { paddingTop: 16, paddingBottom: 8 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textDark },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '600' },
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
  photo: { width: 80, height: 80, borderRadius: 8, marginRight: 8, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textDark,
    marginTop: 6,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  quoteValue: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  finalIcon: { fontSize: 40, marginBottom: 8 },
  finalText: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
});
