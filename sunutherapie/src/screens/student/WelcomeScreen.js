import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../config/theme';
import { Button } from '../../components/ui';

const FEATURES = [
  { icon: 'medkit-outline', tint: colors.primary, bg: colors.primaryLight, title: 'Consulter un psychothérapeute', desc: 'Prenez rendez-vous avec des professionnels qualifiés' },
  { icon: 'chatbubbles-outline', tint: colors.success, bg: colors.successLight, title: 'Forum communautaire', desc: "Échangez avec d'autres étudiants en toute confidentialité" },
  { icon: 'library-outline', tint: colors.warning, bg: colors.warningLight, title: 'Ressources & bibliothèque', desc: 'Articles, livres, vidéos et conseils pour votre bien-être' },
  { icon: 'lock-closed-outline', tint: colors.accent, bg: colors.accentLight, title: '100% confidentiel', desc: 'Vos données sont protégées et sécurisées' },
];

export default function WelcomeScreen({ navigation }) {
  const { user } = useAuth();

  const handleStart = async () => {
    await AsyncStorage.removeItem('show_welcome');
    navigation.replace('StudentTabs');
  };

  const prenom = user?.name?.split(' ')[0] || 'Cher étudiant';

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.userName}>{prenom} 👋</Text>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.title}>Heureux de vous accueillir sur SunuThérapie</Text>
          <Text style={styles.subtitle}>Votre espace bienveillant pour prendre soin de votre santé mentale.</Text>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={24} color={f.tint} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          label="Commencer mon parcours"
          iconRight="arrow-forward"
          onPress={handleStart}
          full
          size="lg"
          style={styles.startBtn}
        />

        <Text style={styles.footerText}>Vous n'êtes pas seul(e). Nous sommes là pour vous accompagner. 💚</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xxxl },
  header: { alignItems: 'center', backgroundColor: colors.primary, paddingTop: spacing.xxxl, paddingBottom: spacing.huge, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  logoContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.white, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 80, height: 80 },
  welcomeText: { fontSize: 16, color: colors.primaryLight, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '700', color: colors.white },
  messageBox: { padding: spacing.xxl, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  featuresContainer: { paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  featureItem: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  startBtn: { marginHorizontal: spacing.xxl, marginTop: spacing.xxl },
  footerText: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginTop: spacing.xl, paddingHorizontal: spacing.xxl, fontStyle: 'italic' },
});
