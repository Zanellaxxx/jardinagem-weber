import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestsContext';

const RequestCard = memo(function RequestCard({ item, onPress }) {
  const date = new Date(item.scheduledDate);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.serviceIcon} {item.serviceName}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
      <Text style={styles.date}>{date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
      <Text style={styles.date}>Prestador: {item.providerName}</Text>
      <StatusBadge status={item.status} />
      {item.quotedValue != null && <Text style={styles.value}>Orçamento: R$ {Number(item.quotedValue).toFixed(2).replace('.', ',')}</Text>}
    </TouchableOpacity>
  );
});

export default function MyRequestsScreen({ navigation }) {
  const { requests } = useRequests();
  const { user } = useAuth();

  const myRequests = useMemo(
    () => requests.filter((item) => item.userEmail === user.email).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [requests, user.email],
  );
  const openRequest = useCallback(
    (id) => navigation.navigate('MyRequestDetailScreen', { requestId: id }),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>Voltar</Text></TouchableOpacity>
        <Text style={styles.title}>Minhas Solicitações</Text>
      </View>
      <FlatList
        data={myRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RequestCard item={item} onPress={() => openRequest(item.id)} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma solicitação ainda.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: 20 },
  back: { color: Colors.primary, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  list: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textDark },
  arrow: { fontSize: 24, color: Colors.textLight },
  date: { fontSize: 13, color: Colors.textMedium },
  value: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, fontWeight: '700', color: Colors.primary },
  empty: { textAlign: 'center', color: Colors.textLight, marginTop: 50 },
});
