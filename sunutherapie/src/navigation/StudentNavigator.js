import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../config/constants';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/student/HomeScreen';
import ConsultationScreen from '../screens/student/ConsultationScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import RessourcesEtudiantScreen from '../screens/student/RessourcesEtudiantScreen';
import ForumScreen from '../screens/student/ForumScreen';
import WelcomeScreen from '../screens/student/WelcomeScreen';
import AssistantScreen from '../screens/student/AssistantScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function StudentTabs() {
  return (
   <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.greyDark,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: '#EEEEEE',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Accueil: 'home-outline',
            Consultations: 'calendar-outline',
            Forum: 'chatbubbles-outline',
            Ressources: 'library-outline',
            Profil: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.white} />
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
