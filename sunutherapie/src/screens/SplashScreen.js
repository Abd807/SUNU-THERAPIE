import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.5);
  const footerOpacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 10, friction: 3, useNativeDriver: true }),
      Animated.timing(footerOpacity, { toValue: 1, duration: 1500, delay: 500, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Welcome'), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      {/* Logo principal */}
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>SunuThérapie</Text>
        <Text style={styles.tagline}>Santé mentale universitaire</Text>
      </Animated.View>

      {/* Partenaires */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <Text style={styles.footerLabel}>Financé par</Text>
        <View style={styles.logosRow}>
          <View style={styles.partnerLogo}>
            <Image
              source={require('../../assets/images/white.png')}
              style={styles.partnerImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.partnerLogo}>
            <Image
              source={require('../../assets/images/mastercard.png')}
              style={styles.partnerImg}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text style={styles.footerSub}>GIE FUAM — Pour les étudiants du Sénégal 🇸🇳</Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B6E6E', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  logo: { width: 140, height: 140 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#C8EEEE', marginTop: 8 },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  footerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  logosRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12 },
  partnerLogo: { width: 80, height: 40, justifyContent: 'center', alignItems: 'center' },
  partnerImg: { width: 80, height: 40 },
  separator: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  footerSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 12 },
});
