import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>SunuThérapie</Text>
        <Text style={styles.tagline}>Votre espace de santé mentale universitaire</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={[styles.card, styles.cardEtudiant]} onPress={() => navigation.navigate('LoginEtudiant')} activeOpacity={0.85}>
          <Text style={styles.cardIcon}>👨‍🎓</Text>
          <Text style={styles.cardTitle}>Je suis Étudiant</Text>
          <Text style={styles.cardSubtitle}>Accéder à mon espace étudiant</Text>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.cardPsy]} onPress={() => navigation.navigate('LoginPsy')} activeOpacity={0.85}>
          <Text style={styles.cardIcon}>👨‍⚕️</Text>
          <Text style={styles.cardTitle}>Je suis Psychothérapeute</Text>
          <Text style={styles.cardSubtitle}>Accéder à mon espace professionnel</Text>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Financé par AMREF Health Africa & Fondation Mastercard</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAFA' },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 30, backgroundColor: '#0B6E6E', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logo: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'white', marginBottom: 12 },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  tagline: { fontSize: 13, color: '#C8EEEE', marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  cardsContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 40, gap: 20 },
  card: { borderRadius: 20, padding: 24 },
  cardEtudiant: { backgroundColor: '#0B6E6E' },
  cardPsy: { backgroundColor: '#0D4F8B' },
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  cardArrow: { fontSize: 24, color: 'rgba(255,255,255,0.7)', position: 'absolute', right: 20, top: 40 },
  footer: { alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 11, color: '#888', textAlign: 'center' },
});
