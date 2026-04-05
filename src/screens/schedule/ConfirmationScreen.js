import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import emailjs from '@emailjs/react-native';
import Button from '../../components/Button';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';

const EMAILJS_SERVICE_ID = 'service_xghwr1x';
const EMAILJS_TEMPLATE_ID = 'template_ipdjqtm';

export default function ConfirmationScreen({ route, navigation }) {
  const { service, scheduledDate, observations, address, photos } = route.params;
  const { user } = useAuth();
  const { addRequest } = useRequests();
  const [loading, setLoading] = useState(false);

  const date = new Date(scheduledDate);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const fullAddress = [
    `${address.street}, ${address.number}`,
    address.complement,
    address.neighborhood,
    address.city,
  ]
    .filter(Boolean)
    .join(' — ');

  async function handleConfirm() {
    setLoading(true);
    try {
      await addRequest({
        serviceId: service.id,
        serviceName: service.name,
        serviceIcon: service.icon,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        scheduledDate,
        observations,
        address,
        photos,
      });

      // Envia e-mail de notificação para a empresa (não bloqueia se falhar)
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          service_name: service.name,
          client_name: user.name,
          client_email: user.email,
          client_phone: user.phone || 'Não informado',
          scheduled_date: date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          }),
          scheduled_time: date.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit',
          }),
          address: fullAddress,
          observations: observations.trim() || 'Nenhuma',
          photos_count: photos.length.toString(),
        });
      } catch (emailErr) {
        console.warn('EmailJS erro:', JSON.stringify(emailErr));
      }

      Alert.alert(
        'Solicitação enviada!',
        'Recebemos seu pedido de orçamento. Nossa equipe entrará em contato em breve.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
      );
    } catch (err) {
      console.error('Erro ao salvar solicitação:', err);
      Alert.alert('Erro', 'Não foi possível salvar a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Confirmar Solicitação</Text>
        <Text style={styles.subtitle}>Revise os dados antes de enviar</Text>

        {/* Serviço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Serviço</Text>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <Text style={styles.serviceName}>{service.name}</Text>
          </View>
        </View>

        {/* Data e hora */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Data e horário preferidos</Text>
          <Text style={styles.cardValue}>📅  {formattedDate}</Text>
          <Text style={[styles.cardValue, { marginTop: 6 }]}>🕐  {formattedTime}</Text>
        </View>

        {/* Endereço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Localização</Text>
          <Text style={styles.cardValue}>📍  {fullAddress}</Text>
        </View>

        {/* Observações */}
        {observations.trim() !== '' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Observações</Text>
            <Text style={styles.cardValue}>{observations}</Text>
          </View>
        )}

        {/* Fotos */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Fotos ({photos.length})</Text>
          {photos.length === 0 ? (
            <Text style={styles.cardValueLight}>Nenhuma foto anexada</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Solicitante */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Solicitante</Text>
          <Text style={styles.cardValue}>👤  {user.name}</Text>
          <Text style={[styles.cardValue, { marginTop: 4 }]}>✉️  {user.email}</Text>
          {user.phone && (
            <Text style={[styles.cardValue, { marginTop: 4 }]}>📞  {user.phone}</Text>
          )}
        </View>

        <Button
          title="Confirmar Solicitação"
          onPress={handleConfirm}
          loading={loading}
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
  subtitle: { fontSize: 15, color: Colors.textMedium, marginBottom: 24 },
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
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardValue: { fontSize: 15, color: Colors.textDark, lineHeight: 22 },
  cardValueLight: { fontSize: 14, color: Colors.textLight },
  serviceRow: { flexDirection: 'row', alignItems: 'center' },
  serviceIcon: { fontSize: 28, marginRight: 12 },
  serviceName: { fontSize: 18, fontWeight: '600', color: Colors.textDark },
  photoScroll: { marginTop: 4 },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
  },
  button: { marginTop: 8 },
});
