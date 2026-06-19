import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Colors from '../../constants/colors';
import { getPaymentMethodLabel, PAYMENT_METHODS, PAYMENT_STATUS_LABELS } from '../../constants/payment';
import { REQUEST_STATUS } from '../../constants/requestStatus';
import { useRequests } from '../../context/RequestsContext';

export default function MyRequestDetailScreen({ route, navigation }) {
  const { requests, acceptQuote, rejectQuote, cancelRequest, rateRequest } = useRequests();
  const id = route.params.requestId || route.params.request?.id;
  const request = requests.find((item) => item.id === id) || route.params.request;
  const [paymentMethod, setPaymentMethod] = useState('');
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  if (!request) return <SafeAreaView style={styles.safe}><Text style={styles.empty}>Solicitação não encontrada.</Text></SafeAreaView>;
  const date = new Date(request.scheduledDate);
  const address = [request.address?.street && `${request.address.street}, ${request.address.number}`, request.address?.complement, request.address?.neighborhood, request.address?.city].filter(Boolean).join(' - ');

  async function run(action, success) {
    setLoading(true);
    try {
      await action();
      Alert.alert('Concluído', success);
    } catch (error) {
      Alert.alert('Atenção', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancellation() {
    setLoading(true);
    try {
      await cancelRequest(id);
      setShowCancelConfirmation(false);
      Alert.alert('Solicitação cancelada', 'O cancelamento foi registrado com sucesso.');
    } catch (error) {
      Alert.alert('Não foi possível cancelar', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>Voltar</Text></TouchableOpacity>
        <View style={styles.titleRow}><Text style={styles.title}>{request.serviceIcon} {request.serviceName}</Text><StatusBadge status={request.status} /></View>

        {request.quotedValue != null && (
          <View style={styles.quote}>
            <Text style={styles.quoteLabel}>Orçamento detalhado</Text>
            <Text style={styles.quoteValue}>R$ {Number(request.quotedValue).toFixed(2).replace('.', ',')}</Text>
            <Text style={styles.quoteText}>{request.adminResponse}</Text>
          </View>
        )}

        {request.status === REQUEST_STATUS.QUOTED && (
          <View style={styles.card}>
            <Text style={styles.label}>Forma de pagamento</Text>
            <View style={styles.options}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity key={method.id} onPress={() => setPaymentMethod(method.id)} style={[styles.option, paymentMethod === method.id && styles.optionSelected]}>
                  <Text style={[styles.optionText, paymentMethod === method.id && styles.optionTextSelected]}>{method.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Aceitar orçamento" onPress={() => run(() => acceptQuote(id, paymentMethod), 'Orçamento aceito. Aguarde a confirmação do administrador.')} loading={loading} />
            <Button title="Recusar orçamento" variant="outline" onPress={() => run(() => rejectQuote(id), 'Orçamento recusado.')} style={styles.action} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Data, horário e endereço</Text>
          <Text style={styles.text}>Prestador: {request.providerName}</Text>
          <Text style={styles.text}>{date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={styles.text}>{address}</Text>
        </View>
        <View style={styles.card}><Text style={styles.label}>Observações</Text><Text style={styles.text}>{request.observations?.trim() || 'Sem observações.'}</Text></View>
        {request.photos?.length > 0 && <PhotoCard label="Fotos enviadas" photos={request.photos} />}
        {request.completionPhotos?.length > 0 && <PhotoCard label="Evidências do serviço concluído" photos={request.completionPhotos} />}

        {request.payment && (
          <View style={styles.card}>
            <Text style={styles.label}>Pagamento</Text>
            <Text style={styles.text}>Forma: {getPaymentMethodLabel(request.payment.method)}</Text>
            <Text style={styles.text}>Status: {PAYMENT_STATUS_LABELS[request.payment.status]}</Text>
          </View>
        )}

        {[REQUEST_STATUS.PENDING, REQUEST_STATUS.QUOTED, REQUEST_STATUS.QUOTE_ACCEPTED, REQUEST_STATUS.CONFIRMED].includes(request.status) && (
          showCancelConfirmation ? (
            <View style={styles.cancelCard}>
              <Text style={styles.cancelTitle}>Confirmar cancelamento?</Text>
              <Text style={styles.text}>
                O cancelamento só é permitido com no mínimo 4 horas de antecedência.
              </Text>
              <Button
                title="Confirmar cancelamento"
                onPress={handleCancellation}
                loading={loading}
              />
              <Button
                title="Manter solicitação"
                variant="outline"
                onPress={() => setShowCancelConfirmation(false)}
                disabled={loading}
              />
            </View>
          ) : (
            <Button
              title="Cancelar solicitação"
              variant="outline"
              onPress={() => setShowCancelConfirmation(true)}
            />
          )
        )}

        {request.status === REQUEST_STATUS.COMPLETED && !request.rating && (
          <View style={styles.card}>
            <Text style={styles.label}>Avaliar serviço</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setScore(value)}><Text style={styles.star}>{value <= score ? '★' : '☆'}</Text></TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.area} value={comment} onChangeText={setComment} placeholder="Conte como foi o serviço" multiline />
            <Button title="Enviar avaliação" onPress={() => run(() => rateRequest(id, score, comment), 'Obrigado pela avaliação.')} loading={loading} />
          </View>
        )}
        {request.rating && <View style={styles.card}><Text style={styles.label}>Sua avaliação</Text><Text style={styles.storedStars}>{'★'.repeat(request.rating.score)}</Text><Text style={styles.text}>{request.rating.comment}</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

function PhotoCard({ label, photos }) {
  return <View style={styles.card}><Text style={styles.label}>{label}</Text><ScrollView horizontal>{photos.map((uri, index) => <Image key={`${index}-${uri.slice(0, 24)}`} source={{ uri }} style={styles.photo} />)}</ScrollView></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 40, gap: 12 },
  back: { color: Colors.primary, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 21, fontWeight: '700', color: Colors.textDark },
  quote: { backgroundColor: Colors.primary, borderRadius: 14, padding: 20, gap: 8 },
  quoteLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase', fontWeight: '700' },
  quoteValue: { color: Colors.white, fontSize: 29, fontWeight: '700' },
  quoteText: { color: Colors.white, lineHeight: 21 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, gap: 9 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.7 },
  text: { color: Colors.textMedium, fontSize: 14, lineHeight: 21 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: Colors.border, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  optionSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { color: Colors.textMedium, fontSize: 13 },
  optionTextSelected: { color: Colors.white, fontWeight: '600' },
  action: { marginTop: 2 },
  photo: { width: 88, height: 88, borderRadius: 8, marginRight: 8 },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 34, color: '#F9A825' },
  storedStars: { fontSize: 24, color: '#F9A825' },
  area: { minHeight: 90, borderWidth: 1, borderColor: Colors.border, borderRadius: 9, padding: 12, textAlignVertical: 'top' },
  empty: { padding: 30, color: Colors.textMedium },
  cancelCard: { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 16, gap: 10 },
  cancelTitle: { color: Colors.error, fontSize: 16, fontWeight: '700' },
});
