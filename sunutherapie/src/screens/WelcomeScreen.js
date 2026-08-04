import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../config/theme';

// Logos partenaires affichés en bas de la page.
// img: null => emplacement texte (placeholder) en attendant le fichier.
// Pour activer OMS / MHSP-DMS : dépose oms.png et mhsp.png (fond transparent)
// dans assets/images/ puis remplace null par require('../../assets/images/xxx.png').
const PARTNERS = [
  // Dépose oms.png et mhsp.png (PNG fond transparent) dans assets/images/,
  // puis dé-commente les deux lignes ci-dessous :
  // { key: 'oms', label: 'OMS', img: require('../../assets/images/oms.png') },
  // { key: 'mhsp', label: 'MHSP/DMS', img: require('../../assets/images/mhsp.png') },
  { key: 'ucad', label: 'UCAD', img: require('../../assets/images/Logoucad.png') },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>SunuThérapie</Text>
        <Text style={styles.tagline}>Votre espace de santé mentale universitaire</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('LoginEtudiant')}
          activeOpacity={0.9}
        >
          <View style={styles.cardIconWrap}>
            <Ionicons name="school" size={26} color={colors.white} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Je suis Étudiant</Text>
            <Text style={styles.cardSubtitle}>Accéder à mon espace étudiant</Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('LoginPsy')}
          activeOpacity={0.9}
        >
          <View style={styles.cardIconWrap}>
            <Ionicons name="medkit" size={26} color={colors.white} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Je suis Psychothérapeute</Text>
            <Text style={styles.cardSubtitle}>Accéder à mon espace professionnel</Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.partnersLabel}>Avec le soutien de</Text>
        <View style={styles.logoRow}>
          {PARTNERS.filter((p) => p.img).map((p) => (
            <View key={p.key} style={styles.logoBox}>
              <Image source={p.img} style={styles.logoImg} resizeMode="contain" />
            </View>
          ))}
        </View>
        <Text style={styles.footerText}>Financé par AMREF Health Africa & Fondation Mastercard</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center', paddingTop: spacing.huge, paddingBottom: spacing.xxxl,
    backgroundColor: colors.primary, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl,
  },
  logo: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.white, marginBottom: spacing.md },
  appName: { fontSize: 26, fontWeight: '700', color: colors.white },
  tagline: { fontSize: 13, color: colors.primaryLight, marginTop: 6, textAlign: 'center', paddingHorizontal: spacing.xl },

  cardsContainer: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, gap: spacing.lg },
  card: { borderRadius: radius.xl, padding: spacing.xl, flexDirection: 'row', alignItems: 'center', ...shadows.md },
  cardIconWrap: {
    width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg,
  },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  cardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3 },

  footer: { alignItems: 'center', paddingBottom: spacing.xl, paddingHorizontal: spacing.xl },
  partnersLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textFaint,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.md,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.md },
  logoBox: {
    height: 60, minWidth: 80, paddingHorizontal: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  logoImg: { width: 56, height: 44 },
  logoPlaceholder: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  footerText: { fontSize: 11, color: colors.textFaint, textAlign: 'center' },
});
