import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, Image, Linking, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../config/theme';
import { Button } from '../../components/ui';

const SUPPORTS = [
  { icon: 'mail-outline', label: 'Email', url: 'mailto:kabdourahmane00@gmail.com?subject=Support SunuThérapie' },
  { icon: 'logo-whatsapp', label: 'WhatsApp', url: 'https://wa.me/221784852249' },
  { icon: 'call-outline', label: 'Appeler', url: 'tel:+221784852249' },
];

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
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.titleRow}>
              <Ionicons name={isPsy ? 'medkit' : 'school'} size={18} color={colors.white} />
              <Text style={styles.title}>{isPsy ? 'Espace Psychothérapeute' : 'Espace Étudiant'}</Text>
            </View>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="exemple@ucad.edu.sn"
                placeholderTextColor={colors.textFaint}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: null }); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textFaint}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <Button label="Se connecter" onPress={handleLogin} loading={loading} full size="lg" style={{ marginTop: spacing.sm }} />

            <TouchableOpacity style={styles.registerLink} onPress={isPsy ? contactAdmin : () => navigation.navigate('Register')}>
              <Text style={styles.registerText}>
                Pas encore de compte ? <Text style={styles.registerTextBold}>{isPsy ? 'Contactez-nous' : "S'inscrire"}</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.supportContainer}>
              <Text style={styles.supportTitle}>Besoin d'aide pour vous connecter ?</Text>
              <View style={styles.supportRow}>
                {SUPPORTS.map((s) => (
                  <TouchableOpacity key={s.label} style={styles.supportBtn} onPress={() => Linking.openURL(s.url)} activeOpacity={0.8}>
                    <Ionicons name={s.icon} size={16} color={colors.primary} />
                    <Text style={styles.supportBtnText}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { alignItems: 'center', backgroundColor: colors.primary, paddingBottom: spacing.xxxl, paddingTop: spacing.md, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  backBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.lg },
  backText: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  logoContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.white, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  logo: { width: 75, height: 75 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 13, color: colors.primaryLight, marginTop: 4 },
  form: { flex: 1, padding: spacing.xxl, paddingTop: spacing.xxxl },
  inputGroup: { marginBottom: spacing.xl },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text },
  inputError: { borderColor: colors.danger },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  registerLink: { alignItems: 'center', marginTop: spacing.xl },
  registerText: { fontSize: 14, color: colors.textMuted },
  registerTextBold: { color: colors.primary, fontWeight: '700' },
  supportContainer: { marginTop: spacing.xxxl, alignItems: 'center', paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  supportTitle: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, textAlign: 'center' },
  supportRow: { flexDirection: 'row', gap: spacing.sm },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  supportBtnText: { fontSize: 13, color: colors.text, fontWeight: '600' },
});
