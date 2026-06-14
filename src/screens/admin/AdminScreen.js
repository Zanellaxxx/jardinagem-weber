import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import Colors from '../../constants/colors';
import { REQUEST_STATUS } from '../../constants/requestStatus';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';
import { useSync } from '../../context/SyncContext';

function fullAddress(address = {}) {
  return [address.street && `${address.street}, ${address.number}`, address.complement, address.neighborhood, address.city]
    .filter(Boolean)
    .join(' - ');
}

const RequestCard = memo(function RequestCard({ item, onPress }) {
  const date = new Date(item.scheduledDate);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.serviceName}>{item.serviceIcon} {item.serviceName}</Text>
          <Text style={styles.clientName}>{item.userName}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.detail}>
        {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.detail}>{fullAddress(item.address)}</Text>
      <Text style={styles.observation} numberOfLines={3}>
        {item.observations?.trim() || 'Sem observações.'}
      </Text>
    </TouchableOpacity>
  );
});

export default function AdminScreen({ navigation }) {
  const { requests } = useRequests();
  const { logout, user } = useAuth();
  const { isConnected, pendingChanges, syncing, syncConfigured } = useSync();
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;

  const providerRequests = useMemo(
    () => requests.filter((request) => request.providerId === user.providerId),
    [requests, user.providerId],
  );

  const sorted = useMemo(
    () => [...providerRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [providerRequests],
  );
  const metrics = useMemo(() => {
    const count = (...statuses) => providerRequests.filter((request) => statuses.includes(request.status)).length;
    const quoted = providerRequests.filter((request) => request.quotedValue != null).length;
    const accepted = count(
      REQUEST_STATUS.QUOTE_ACCEPTED,
      REQUEST_STATUS.CONFIRMED,
      REQUEST_STATUS.IN_PROGRESS,
      REQUEST_STATUS.COMPLETED,
      REQUEST_STATUS.RATED,
    );
    return [
      ['Total de solicitações', providerRequests.length],
      ['Pendentes', count(REQUEST_STATUS.PENDING, REQUEST_STATUS.QUOTED, REQUEST_STATUS.QUOTE_ACCEPTED)],
      ['Confirmadas/agendadas', count(REQUEST_STATUS.CONFIRMED)],
      ['Em andamento', count(REQUEST_STATUS.IN_PROGRESS)],
      ['Concluídas', count(REQUEST_STATUS.COMPLETED, REQUEST_STATUS.RATED)],
      ['Canceladas', count(REQUEST_STATUS.CANCELLED)],
      ['Recusadas', count(REQUEST_STATUS.QUOTE_REJECTED)],
      ['Conversão de orçamentos', quoted ? `${Math.round((accepted / quoted) * 100)}%` : '0%'],
    ];
  }, [providerRequests]);
  const rating = useMemo(() => {
    const ratings = providerRequests.map((request) => request.rating?.score).filter(Boolean);
    return ratings.length ? (ratings.reduce((sum, score) => sum + score, 0) / ratings.length).toFixed(1) : '-';
  }, [providerRequests]);
  const openRequest = useCallback(
    (id) => navigation.navigate('RequestDetailScreen', { requestId: id }),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Text style={styles.headerSub}>
            {user.name} · nota {rating} · {isConnected ? 'Conectado' : 'Offline'}
            {syncConfigured ? ` · ${syncing ? 'sincronizando' : `${pendingChanges} pendentes`}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Sair</Text></TouchableOpacity>
      </View>
      <View style={styles.metrics}>
        {metrics.map(([label, value]) => (
          <View key={label} style={styles.metric}>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        key={columns}
        data={sorted}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={columns > 1 ? styles.columns : undefined}
        renderItem={({ item }) => (
          <RequestCard item={item} onPress={() => openRequest(item.id)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma solicitação ainda.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primary, padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  logoutBtn: { borderWidth: 1, borderColor: Colors.white, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  logoutText: { color: Colors.white, fontWeight: '600' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  metric: { flexGrow: 1, flexBasis: 135, backgroundColor: Colors.surface, borderRadius: 10, padding: 12 },
  metricValue: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  metricLabel: { fontSize: 11, color: Colors.textMedium, marginTop: 2 },
  list: { width: '100%', maxWidth: 1200, alignSelf: 'center', padding: 12, paddingBottom: 30 },
  columns: { gap: 12 },
  card: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, minWidth: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  clientName: { fontSize: 13, color: Colors.textMedium, marginTop: 3 },
  detail: { fontSize: 13, color: Colors.textMedium, lineHeight: 20 },
  observation: { fontSize: 13, color: Colors.textLight, lineHeight: 19, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, marginTop: 8 },
  empty: { textAlign: 'center', color: Colors.textLight, marginTop: 40 },
});
