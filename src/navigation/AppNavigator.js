import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/services/ServiceDetailScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import LocationScreen from '../screens/schedule/LocationScreen';
import PhotosScreen from '../screens/schedule/PhotosScreen';
import ConfirmationScreen from '../screens/schedule/ConfirmationScreen';
import MyRequestsScreen from '../screens/requests/MyRequestsScreen';
import MyRequestDetailScreen from '../screens/requests/MyRequestDetailScreen';
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
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
      <Stack.Screen name="LocationScreen" component={LocationScreen} />
      <Stack.Screen name="PhotosScreen" component={PhotosScreen} />
      <Stack.Screen name="ConfirmationScreen" component={ConfirmationScreen} />
      <Stack.Screen name="MyRequestsScreen" component={MyRequestsScreen} />
      <Stack.Screen name="MyRequestDetailScreen" component={MyRequestDetailScreen} />
    </Stack.Navigator>
  );
}
