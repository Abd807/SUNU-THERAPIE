import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';

import HomeScreen from '../screens/psy/HomeScreen';
import ConsultationsScreen from '../screens/psy/ConsultationsScreen';
import ProfileScreen from '../screens/psy/ProfileScreen';
import DisponibilitesScreen from '../screens/psy/DisponibilitesScreen';
import RessourcesNotesScreen from '../screens/psy/RessourcesNotesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ICONS = {
  Accueil: 'home',
  Consultations: 'clipboard',
  Calendrier: 'calendar',
  Ressources: 'library',
  Profil: 'person',
};

function PsyTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const base = ICONS[route.name] || 'ellipse';
          const name = focused ? base : `${base}-outline`;
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Consultations" component={ConsultationsScreen} />
      <Tab.Screen name="Calendrier" component={DisponibilitesScreen} />
      <Tab.Screen name="Ressources" component={RessourcesNotesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
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
