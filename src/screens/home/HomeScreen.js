import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import SERVICES from '../../constants/services';

function ServiceCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.cardIcon}>{item.icon}</Text>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAction}>Ver detalhes →</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const firstName = user?.name?.split(' ')[0] || 'Olá';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName}! 👋</Text>
          <Text style={styles.subGreeting}>O que precisa hoje?</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Jardinagem Weber</Text>
        <Text style={styles.bannerSub}>Solicite um orçamento agora mesmo</Text>
      </View>

      <Text style={styles.sectionTitle}>Nossos Serviços</Text>

      <FlatList
        data={SERVICES}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            onPress={() => navigation.navigate('ServiceDetail', { service: item })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.textDark },
  subGreeting: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  logoutText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  banner: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 6 },
  cardDescription: { fontSize: 12, color: Colors.textLight, lineHeight: 17 },
  cardFooter: { marginTop: 10 },
  cardAction: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
