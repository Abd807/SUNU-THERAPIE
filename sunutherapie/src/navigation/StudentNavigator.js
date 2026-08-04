import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';

import HomeScreen from '../screens/student/HomeScreen';
import ConsultationScreen from '../screens/student/ConsultationScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import RessourcesEtudiantScreen from '../screens/student/RessourcesEtudiantScreen';
import ForumScreen from '../screens/student/ForumScreen';
import WelcomeScreen from '../screens/student/WelcomeScreen';
import AssistantScreen from '../screens/student/AssistantScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ICONS = {
  Accueil: 'home',
  Consultations: 'calendar',
  Forum: 'chatbubbles',
  Ressources: 'library',
  Profil: 'person',
};

function StudentTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        // Hauteur + marge basse adaptées à la safe area (barre de gestes / home indicator)
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
      <Tab.Screen name="Consultations" component={ConsultationScreen} />
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Ressources" component={RessourcesEtudiantScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkWelcome = async () => {
      const showWelcome = await AsyncStorage.getItem('show_welcome');
      setInitialRoute(showWelcome === 'true' ? 'Welcome' : 'StudentTabs');
    };
    checkWelcome();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen name="Assistant" component={AssistantScreen} />
    </Stack.Navigator>
  );
}
