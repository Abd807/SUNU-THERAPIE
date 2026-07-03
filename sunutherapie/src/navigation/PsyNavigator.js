import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { COLORS } from '../config/constants';

import HomeScreen from '../screens/psy/HomeScreen';
import ConsultationsScreen from '../screens/psy/ConsultationsScreen';
import ProfileScreen from '../screens/psy/ProfileScreen';
import DisponibilitesScreen from '../screens/psy/DisponibilitesScreen';
import RessourcesNotesScreen from '../screens/psy/RessourcesNotesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PsyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.greyDark,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: '#EEEEEE',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text> }} />
      <Tab.Screen name="Consultations" component={ConsultationsScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text> }} />
      <Tab.Screen name="Calendrier" component={DisponibilitesScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>📅</Text> }} />
      <Tab.Screen name="Ressources" component={RessourcesNotesScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>📚</Text> }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

export default function PsyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PsyTabs" component={PsyTabs} />
    </Stack.Navigator>
  );
}
