import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, Image, Linking, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

export default function LoginScreen({ navigation, route }) {
  const role = route.params?.role || 'etudiant';
  const isPsy = role === 'psychologue';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email invalide';
    if (!password) newErrors.password = 'Mot de passe requis';
    else if (password.length < 6) newErrors.password = 'Minimum 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (!result.success) {
        Alert.alert('Erreur de connexion', result.message || 'Email ou mot de passe incorrect');
      } else if (result.user?.role !== role && result.user?.role !== 'admin') {
        Alert.alert('Accès refusé', `Ce compte n'est pas un compte ${isPsy ? 'psychothérapeute' : 'étudiant'}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const contactAdmin = () => {
    Linking.openURL('mailto:kabdourahmane00@gmail.com?subject=Demande de compte psychothérapeute - SunuThérapie');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>

            <View style={styles.logosRow}>
              <View style={styles.logoContainer}>
                <Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
              </View>
            </View>

            <Text style={styles.title}>{isPsy ? '👨‍⚕️ Espace Psychothérapeute' : '👨‍🎓 Espace Étudiant'}</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="exemple@ucad.edu.sn"
                placeholderTextColor={COLORS.greyDark}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: null }); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.greyDark}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            {!isPsy ? (
              <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>
                  Pas encore de compte ? <Text style={styles.registerTextBold}>S'inscrire</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.registerLink} onPress={contactAdmin}>
                <Text style={styles.registerText}>
                  Pas encore de compte ? <Text style={styles.registerTextBold}>Contactez-nous</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Support */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportTitle}>🆘 Besoin d'aide pour vous connecter ?</Text>
              <View style={styles.supportRow}>
                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('mailto:kabdourahmane00@gmail.com?subject=Support SunuThérapie')}
                >
                  <Text style={styles.supportBtnText}>📧 Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('https://wa.me/221784852249')}
                >
                  <Text style={styles.supportBtnText}>💬 WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('tel:+221784852249')}
                >
                  <Text style={styles.supportBtnText}>📞 Appeler</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  header: { alignItems: 'center', backgroundColor: COLORS.primary, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { alignSelf: 'flex-start', padding: 16 },
  backText: { color: COLORS.primaryLight, fontSize: 14 },
  logosRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logoContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 75, height: 75 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.primaryLight },
  form: { flex: 1, padding: 24, paddingTop: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text },
  inputError: { borderColor: COLORS.danger },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeIcon: { fontSize: 18 },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  loginBtnDisabled: { backgroundColor: COLORS.greyDark },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerText: { fontSize: 14, color: COLORS.textMuted },
  registerTextBold: { color: COLORS.primary, fontWeight: 'bold' },
  supportContainer: { marginTop: 30, alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  supportTitle: { fontSize: 13, color: COLORS.greyDark, marginBottom: 12, textAlign: 'center' },
  supportRow: { flexDirection: 'row', gap: 10 },
  supportBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#D4EDED', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  supportBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
});
