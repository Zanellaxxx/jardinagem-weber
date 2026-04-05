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
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending: { label: 'Aguardando', color: '#F9A825', bg: '#FFF8E1' },
  quoted: { label: 'Orçado', color: '#1565C0', bg: '#E3F2FD' },
  confirmed: { label: 'Confirmado', color: Colors.success, bg: '#E8F5E9' },
  rejected: { label: 'Recusado', color: Colors.error, bg: '#FFEBEE' },
};

export default function AdminScreen({ navigation }) {
  const { requests, loadRequests } = useRequests();
  const { logout, user } = useAuth();

  useEffect(() => {
    loadRequests();
    const unsubscribe = navigation.addListener('focus', loadRequests);
    return unsubscribe;
  }, [navigation]);

  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  function renderItem({ item }) {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const date = new Date(item.scheduledDate);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RequestDetailScreen', { request: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceIcon}>{item.serviceIcon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.clientName}>{item.userName}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>📅 {formattedDate} às {formattedTime}</Text>
          <Text style={styles.footerText}>
            📍 {item.address.neighborhood}, {item.address.city}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Text style={styles.headerSub}>Jardinagem Weber</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{requests.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: '#F9A825' }]}>
            {requests.filter((r) => r.status === 'pending').length}
          </Text>
          <Text style={styles.summaryLabel}>Pendentes</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: Colors.success }]}>
            {requests.filter((r) => r.status === 'confirmed').length}
          </Text>
          <Text style={styles.summaryLabel}>Confirmados</Text>
        </View>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Nenhuma solicitação ainda</Text>
          <Text style={styles.emptyHint}>As solicitações dos clientes aparecerão aqui</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutText: { color: Colors.white, fontSize: 14, fontWeight: '500' },
  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: 26, fontWeight: '700', color: Colors.textDark },
  summaryLabel: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  serviceIcon: { fontSize: 28, marginRight: 12 },
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  clientName: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardFooter: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 4 },
  footerText: { fontSize: 13, color: Colors.textMedium },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textDark },
  emptyHint: { fontSize: 14, color: Colors.textLight, marginTop: 6 },
});
