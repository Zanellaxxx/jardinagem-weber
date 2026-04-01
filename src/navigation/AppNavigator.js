import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/services/ServiceDetailScreen';
import Colors from '../constants/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={({ route }) => ({
          title: route.params?.service?.name || 'Serviço',
          headerShown: false,
        })}
      />
      {/*
        TODO: adicionar as próximas rotas aqui:
        - ScheduleScreen (agendamento/orçamento)
        - LocationScreen (seleção de localização via Google Maps)
        - PhotosScreen (anexar fotos)
        - ConfirmationScreen (confirmação do agendamento)
      */}
    </Stack.Navigator>
  );
}
