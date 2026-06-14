import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Colors from '../../constants/colors';
import { getPaymentMethodLabel, PAYMENT_STATUS_LABELS } from '../../constants/payment';
import { REQUEST_STATUS } from '../../constants/requestStatus';
import { useRequests } from '../../context/RequestsContext';

function money(value) {
  return value == null ? '-' : `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

export default function RequestDetailScreen({ route, navigation }) {
  const {
    requests, sendQuote, confirmRequest, startRequest,
    completeRequest, markPaymentPaid, rejectRequest,
  } = useRequests();
  const id = route.params.requestId || route.params.request?.id;
  const request = requests.find((item) => item.id === id) || route.params.request;
  const [quotedValue, setQuotedValue] = useState(request?.quotedValue == null ? '' : String(request.quotedValue));
  const [description, setDescription] = useState(request?.adminResponse || '');
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  async function pickCompletionPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permissão necessária', 'Permita o acesso à galeria.');
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) setCompletionPhotos((current) => [...current, result.assets[0].uri]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>Voltar</Text></TouchableOpacity>
        <View style={styles.titleRow}><Text style={styles.title}>Solicitação</Text><StatusBadge status={request.status} /></View>

        <View style={styles.card}>
          <Text style={styles.label}>Serviço e cliente</Text>
          <Text style={styles.heading}>{request.serviceIcon} {request.serviceName}</Text>
          <Text style={styles.text}>Prestador: {request.providerName}</Text>
          <Text style={styles.text}>{request.userName} · {request.userEmail} · {request.userPhone || 'sem telefone'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Agendamento e local</Text>
          <Text style={styles.text}>{date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={styles.text}>{address}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Descrição/observações</Text>
          <Text style={styles.text}>{request.observations?.trim() || 'Sem observações.'}</Text>
        </View>
        {request.photos?.length > 0 && <PhotoCard label="Imagens da solicitação" photos={request.photos} />}

        {request.quotedValue != null && (
          <View style={styles.card}>
            <Text style={styles.label}>Orçamento detalhado</Text>
            <Text style={styles.quote}>{money(request.quotedValue)}</Text>
            <Text style={styles.text}>{request.adminResponse}</Text>
          </View>
        )}

        {request.payment && (
          <View style={styles.card}>
            <Text style={styles.label}>Pagamento</Text>
            <Text style={styles.text}>Forma: {getPaymentMethodLabel(request.payment.method)}</Text>
            <Text style={styles.text}>Status: {PAYMENT_STATUS_LABELS[request.payment.status]}</Text>
            {request.payment.status !== 'paid' && request.payment.method !== 'cash' && (
              <Button title="Registrar como pago" onPress={() => run(() => markPaymentPaid(id), 'Pagamento atualizado.')} loading={loading} style={styles.action} />
            )}
          </View>
        )}

        {request.status === REQUEST_STATUS.PENDING && (
          <View style={styles.card}>
            <Text style={styles.label}>Enviar orçamento</Text>
            <TextInput style={styles.input} value={quotedValue} onChangeText={setQuotedValue} placeholder="Valor em reais" keyboardType="decimal-pad" />
            <TextInput style={[styles.input, styles.area]} value={description} onChangeText={setDescription} placeholder="Descrição detalhada obrigatória" multiline />
            <Button title="Enviar orçamento" onPress={() => run(() => sendQuote(id, quotedValue, description), 'Orçamento enviado ao cliente.')} loading={loading} />
            <Button title="Recusar solicitação" variant="outline" onPress={() => run(() => rejectRequest(id), 'Solicitação recusada.')} style={styles.action} />
          </View>
        )}

        {request.status === REQUEST_STATUS.QUOTED && <Notice text="Aguardando o cliente aceitar ou recusar o orçamento." />}
        {request.status === REQUEST_STATUS.QUOTE_ACCEPTED && (
          <Button title="Confirmar/agendar serviço" onPress={() => run(() => confirmRequest(id), 'Serviço confirmado.')} loading={loading} />
        )}
        {request.status === REQUEST_STATUS.CONFIRMED && (
          <Button title="Marcar como em andamento" onPress={() => run(() => startRequest(id), 'Serviço iniciado.')} loading={loading} />
        )}
        {[REQUEST_STATUS.CONFIRMED, REQUEST_STATUS.IN_PROGRESS].includes(request.status) && (
          <View style={styles.card}>
            <Text style={styles.label}>Concluir com evidências</Text>
            <Button title="Adicionar imagem de conclusão" variant="outline" onPress={pickCompletionPhoto} />
            {completionPhotos.length > 0 && <PhotoStrip photos={completionPhotos} />}
            <Button title="Marcar serviço como concluído" onPress={() => run(() => completeRequest(id, completionPhotos), 'Serviço concluído.')} loading={loading} style={styles.action} />
          </View>
        )}
        {request.completionPhotos?.length > 0 && <PhotoCard label="Evidências de conclusão" photos={request.completionPhotos} />}
        {request.rating && (
          <View style={styles.card}>
            <Text style={styles.label}>Avaliação do cliente</Text>
            <Text style={styles.heading}>{'★'.repeat(request.rating.score)}{'☆'.repeat(5 - request.rating.score)}</Text>
            <Text style={styles.text}>{request.rating.comment}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PhotoStrip({ photos }) {
  return <ScrollView horizontal>{photos.map((uri) => <Image key={uri} source={{ uri }} style={styles.photo} />)}</ScrollView>;
}
function PhotoCard({ label, photos }) {
  return <View style={styles.card}><Text style={styles.label}>{label}</Text><PhotoStrip photos={photos} /></View>;
}
function Notice({ text }) {
  return <View style={styles.notice}><Text style={styles.text}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { width: '100%', maxWidth: 860, alignSelf: 'center', padding: 20, paddingBottom: 40, gap: 12 },
  back: { color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textDark },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, gap: 8 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.7 },
  heading: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  text: { fontSize: 14, color: Colors.textMedium, lineHeight: 21 },
  quote: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 9, padding: 12, color: Colors.textDark },
  area: { minHeight: 90, textAlignVertical: 'top' },
  action: { marginTop: 6 },
  photo: { width: 88, height: 88, borderRadius: 8, marginRight: 8 },
  notice: { backgroundColor: '#E3F2FD', borderRadius: 10, padding: 14 },
  empty: { padding: 30, color: Colors.textMedium },
});
