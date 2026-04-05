import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequests } from '../../context/RequestsContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

const STATUS_CONFIG = {
  pending: { label: 'Aguardando orçamento', color: '#F9A825', bg: '#FFF8E1', icon: '⏳' },
  quoted: { label: 'Orçamento recebido', color: '#1565C0', bg: '#E3F2FD', icon: '💰' },
  confirmed: { label: 'Confirmado', color: Colors.success, bg: '#E8F5E9', icon: '✅' },
  rejected: { label: 'Recusado', color: Colors.error, bg: '#FFEBEE', icon: '❌' },
};

export default function MyRequestsScreen({ navigation }) {
  const { requests, loadRequests } = useRequests();
  const { user } = useAuth();

  useEffect(() => {
    loadRequests();
    const unsubscribe = navigation.addListener('focus', loadRequests);
    return unsubscribe;
  }, [navigation]);

  const myRequests = requests
    .filter((r) => r.userEmail === user.email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function renderItem({ item }) {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const date = new Date(item.scheduledDate);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MyRequestDetailScreen', { request: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceIcon}>{item.serviceIcon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.dateText}>
              📅 {formattedDate} às {formattedTime}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={styles.badgeIcon}>{status.icon}</Text>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>

        {item.status === 'quoted' && item.quotedValue && (
          <View style={styles.quotePreview}>
            <Text style={styles.quoteLabel}>Orçamento:</Text>
            <Text style={styles.quoteValue}>{item.quotedValue}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Solicitações</Text>
      </View>

      {myRequests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Nenhuma solicitação ainda</Text>
          <Text style={styles.emptyHint}>
            Solicite um orçamento escolhendo um serviço na tela inicial
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyBtnText}>Ver serviços</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { marginBottom: 6 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  list: { padding: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: { fontSize: 28, marginRight: 12 },
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  dateText: { fontSize: 13, color: Colors.textLight, marginTop: 3 },
  arrow: { fontSize: 22, color: Colors.textLight },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  badgeIcon: { fontSize: 13 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  quotePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  quoteLabel: { fontSize: 13, color: Colors.textLight },
  quoteValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textDark, textAlign: 'center' },
  emptyHint: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '600', fontSize: 15 },
});
