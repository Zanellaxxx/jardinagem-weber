import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Colors from '../../constants/colors';

const MAX_PHOTOS = 5;

export default function PhotosScreen({ route, navigation }) {
  const { service, scheduledDate, observations, address } = route.params;
  const [photos, setPhotos] = useState([]);

  async function pickImage(fromCamera) {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limite atingido', `Máximo de ${MAX_PHOTOS} fotos permitido.`);
      return;
    }

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão negada',
        fromCamera
          ? 'Permita o acesso à câmera nas configurações.'
          : 'Permita o acesso à galeria nas configurações.',
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: false });

    if (!result.canceled && result.assets?.length > 0) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }

  function removePhoto(uri) {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  }

  function handleNext() {
    navigation.navigate('ConfirmationScreen', {
      service,
      scheduledDate,
      observations,
      address,
      photos,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Fotos do Local</Text>
        <Text style={styles.subtitle}>
          Adicione fotos para ajudar nossa equipe a preparar o orçamento.
        </Text>

        {/* Botões de adicionar */}
        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => pickImage(true)}>
            <Text style={styles.addIcon}>📷</Text>
            <Text style={styles.addLabel}>Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => pickImage(false)}>
            <Text style={styles.addIcon}>🖼️</Text>
            <Text style={styles.addLabel}>Galeria</Text>
          </TouchableOpacity>
        </View>

        {/* Contador */}
        <Text style={styles.counter}>
          {photos.length}/{MAX_PHOTOS} fotos adicionadas
        </Text>

        {/* Grid de fotos */}
        {photos.length > 0 && (
          <FlatList
            data={photos}
            keyExtractor={(item) => item}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.photoRow}
            renderItem={({ item }) => (
              <View style={styles.photoWrapper}>
                <Image source={{ uri: item }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePhoto(item)}
                >
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {photos.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyText}>Nenhuma foto adicionada</Text>
            <Text style={styles.emptyHint}>As fotos são opcionais mas ajudam muito!</Text>
          </View>
        )}

        <Button
          title="Avançar — Confirmar"
          onPress={handleNext}
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
  subtitle: { fontSize: 15, color: Colors.textMedium, marginBottom: 24, lineHeight: 22 },
  addRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  addIcon: { fontSize: 28, marginBottom: 6 },
  addLabel: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  counter: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
    textAlign: 'right',
  },
  photoRow: { gap: 10, marginBottom: 10 },
  photoWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 36,
    marginBottom: 16,
  },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textMedium },
  emptyHint: { fontSize: 13, color: Colors.textLight, marginTop: 4 },
  button: { marginTop: 8 },
});
