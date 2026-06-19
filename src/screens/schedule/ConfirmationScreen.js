import React, { useEffect, useState } from 'react';
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
import Button from '../../components/Button';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { providerRepository } from '../../repositories/providerRepository';
import { DEFAULT_PROVIDER } from '../../constants/providers';
import { emailService } from '../../services/emailService';

export default function ConfirmationScreen({ route, navigation }) {
  const { service, scheduledDate, observations, address, photos } = route.params;
  const { user } = useAuth();
  const { addRequest } = useRequests();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([DEFAULT_PROVIDER]);
  const [providerId, setProviderId] = useState(DEFAULT_PROVIDER.id);
  const [providerError, setProviderError] = useState('');

  useEffect(() => {
    providerRepository.getAll().then((items) => {
      const active = items.filter((provider) => provider.active);
      if (active.length) {
        setProviders(active);
        setProviderId((current) => current || active[0].id);
      }
    }).catch(() => {
      setProviderError('Não foi possível carregar os prestadores. O prestador padrão será utilizado.');
    });
  }, []);

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
    if (!providerId) {
      Alert.alert('Atenção', 'Selecione um prestador antes de confirmar.');
      return;
    }
    setLoading(true);
    try {
      const selectedProvider = providers.find((provider) => provider.id === providerId);
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
        providerId,
      });

      let emailResult = null;
      let emailError = null;
      try {
        emailResult = await emailService.sendNewRequestNotification({
          service,
          user,
          scheduledDate,
          observations,
          address,
          photos,
          providerName: selectedProvider?.name,
        });
      } catch (error) {
        emailError = error;
      }

      const emailSent = Boolean(emailResult);

      navigation.navigate('MyRequestsScreen');
      Alert.alert(
        'Solicitação enviada!',
        emailSent
          ? 'Recebemos seu pedido de orçamento e enviamos a notificação por e-mail.'
          : `Recebemos seu pedido, mas o e-mail não foi enviado. ${emailError?.message || 'Verifique a configuração de e-mail.'}`,
      );
    } catch (error) {
      Alert.alert('Não foi possível enviar', error.message || 'Tente novamente.');
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

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Prestador</Text>
          <View style={styles.providerOptions}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                onPress={() => setProviderId(provider.id)}
                style={[styles.providerOption, providerId === provider.id && styles.providerSelected]}
              >
                <Text style={[styles.providerText, providerId === provider.id && styles.providerTextSelected]}>
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {providerError ? <Text style={styles.errorText}>{providerError}</Text> : null}
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
          disabled={!providerId}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 40 },
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
  providerOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerOption: { borderWidth: 1, borderColor: Colors.border, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 },
  providerSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  providerText: { color: Colors.textMedium, fontSize: 13 },
  providerTextSelected: { color: Colors.white, fontWeight: '600' },
  errorText: { color: Colors.error, fontSize: 12, lineHeight: 18, marginTop: 8 },
});
