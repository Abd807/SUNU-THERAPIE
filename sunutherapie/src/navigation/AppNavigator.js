import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import StudentNavigator from './StudentNavigator';
import PsyNavigator from './PsyNavigator';
import VideoCallScreen from '../screens/shared/VideoCallScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B6E6E' }}>
        <ActivityIndicator size={50} color="#FFFFFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
       {!user ? (
            <>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="LoginEtudiant" component={LoginScreen} initialParams={{ role: 'etudiant' }} />
              <Stack.Screen name="LoginPsy" component={LoginScreen} initialParams={{ role: 'psychologue' }} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            </>
        ) : userProfile?.role === 'psychologue' ? (
          <>
            <Stack.Screen name="PsyApp" component={PsyNavigator} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="StudentApp" component={StudentNavigator} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
