import { enableScreens } from 'react-native-screens';
import { init as initEmailJs } from '@emailjs/react-native';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RequestsProvider } from './src/context/RequestsContext';
import { SyncProvider } from './src/context/SyncContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import Colors from './src/constants/colors';

enableScreens();
if (process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY) {
  initEmailJs({ publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY });
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (user.isAdmin) return <AdminNavigator />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <SyncProvider>
            <RequestsProvider>
              <StatusBar style="light" backgroundColor={Colors.primary} />
              <RootNavigator />
            </RequestsProvider>
          </SyncProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
