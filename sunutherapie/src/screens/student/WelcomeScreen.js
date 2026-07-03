import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Image, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

export default function WelcomeScreen({ navigation }) {
  const { user } = useAuth();

  const handleStart = async () => {
    await AsyncStorage.removeItem('show_welcome');
    navigation.replace('StudentTabs');
  };

  const prenom = user?.name?.split(' ')[0] || 'Cher étudiant';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header avec logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.userName}>{prenom} 👋</Text>
        </View>

        {/* Message principal */}
        <View style={styles.messageBox}>
          <Text style={styles.title}>🌿 Heureux de vous accueillir sur SunuThérapie</Text>
          <Text style={styles.subtitle}>
            Votre espace bienveillant pour prendre soin de votre santé mentale.
          </Text>
        </View>

        {/* Fonctionnalités principales */}
        <View style={styles.featuresContainer}>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👨‍⚕️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Consulter un psychothérapeute</Text>
              <Text style={styles.featureDesc}>
                Prenez rendez-vous avec des professionnels qualifiés
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Forum communautaire</Text>
              <Text style={styles.featureDesc}>
                Échangez avec d'autres étudiants en toute confidentialité
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📚</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Ressources thérapeutiques</Text>
              <Text style={styles.featureDesc}>
                Articles, exercices et conseils pour votre bien-être
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>100% confidentiel</Text>
              <Text style={styles.featureDesc}>
                Vos données sont protégées et sécurisées
              </Text>
            </View>
          </View>

        </View>

        {/* Bouton démarrer */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Commencer mon parcours</Text>
          <Text style={styles.startBtnArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Vous n'êtes pas seul(e). Nous sommes là pour vous accompagner. 💚
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'white',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.primaryLight,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  messageBox: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4EDED',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  startBtnArrow: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 20,
    paddingHorizontal: 24,
    fontStyle: 'italic',
  },
});
