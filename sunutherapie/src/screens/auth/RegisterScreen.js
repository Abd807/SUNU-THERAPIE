import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, Image,
  ScrollView, Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

const DOMAINES_AUTORISES = [
  '@ucad.edu.sn',
  '@ugb.edu.sn',
  '@univ-thies.sn',
  '@unstim.sn',
  '@zig.univ.sn',
  '@uadb.edu.sn',
  '@gmail.com', // temporaire tests
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    telephone: '',
    email: '',
    password: '',
    password_confirmation: '',
    numero_carte_etudiant: '',
    universite: 'UCAD',
    faculte: '',
    niveau: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();

  const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'];

  const updateForm = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nom requis';
    if (!form.telephone.trim()) newErrors.telephone = 'Téléphone requis';
    if (!form.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email invalide';
    } else if (!DOMAINES_AUTORISES.some(d => form.email.toLowerCase().endsWith(d))) {
      newErrors.email = 'Utilisez votre email universitaire officiel (ex: @ucad.edu.sn)';
    }
    if (!form.password) newErrors.password = 'Mot de passe requis';
    else if (form.password.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    if (!form.numero_carte_etudiant.trim()) newErrors.numero_carte_etudiant = 'Numéro de carte requis';
    if (!form.faculte.trim()) newErrors.faculte = 'Faculté requise';
    if (!form.niveau) newErrors.niveau = 'Niveau requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await register(form);
      if (!result.success) {
        if (result.errors) {
          const apiErrors = {};
          Object.keys(result.errors).forEach(key => {
            apiErrors[key] = result.errors[key][0];
          });
          setErrors(apiErrors);
        } else {
          Alert.alert('Erreur', result.message || 'Erreur lors de la création du compte');
        }
      }
      // Si succès : pas besoin de navigate, AppNavigator bascule auto vers StudentApp
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
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
              <View style={styles.logoSeparator}>
                <Text style={styles.logoX}>×</Text>
              </View>
              <View style={styles.logoContainer}>
                <Image source={require('../../../assets/images/Logoucad.png')} style={styles.logo} resizeMode="contain" />
              </View>
            </View>
            <Text style={styles.title}>👨‍🎓 Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez SunuThérapie</Text>
          </View>

          <View style={styles.form}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Prénom et Nom"
                placeholderTextColor={COLORS.greyDark}
                value={form.name}
                onChangeText={(v) => updateForm('name', v)}
                editable={!loading}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput
                style={[styles.input, errors.telephone && styles.inputError]}
                placeholder="Ex: 77 XXX XX XX"
                placeholderTextColor={COLORS.greyDark}
                value={form.telephone}
                onChangeText={(v) => updateForm('telephone', v)}
                keyboardType="phone-pad"
                editable={!loading}
              />
              {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse email universitaire</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="exemple@ucad.edu.sn"
                placeholderTextColor={COLORS.greyDark}
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : (
                <Text style={styles.hintText}>Domaines acceptés : @ucad.edu.sn, @ugb.edu.sn...</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro carte étudiant</Text>
              <TextInput
                style={[styles.input, errors.numero_carte_etudiant && styles.inputError]}
                placeholder="Ex: 20XXXXXXX"
                placeholderTextColor={COLORS.greyDark}
                value={form.numero_carte_etudiant}
                onChangeText={(v) => updateForm('numero_carte_etudiant', v)}
                editable={!loading}
              />
              {errors.numero_carte_etudiant && <Text style={styles.errorText}>{errors.numero_carte_etudiant}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Faculté</Text>
              <TextInput
                style={[styles.input, errors.faculte && styles.inputError]}
                placeholder="Ex: Lettres, Sciences, Médecine..."
                placeholderTextColor={COLORS.greyDark}
                value={form.faculte}
                onChangeText={(v) => updateForm('faculte', v)}
                editable={!loading}
              />
              {errors.faculte && <Text style={styles.errorText}>{errors.faculte}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Niveau</Text>
              <View style={styles.niveauxRow}>
                {niveaux.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.niveauBtn, form.niveau === n && styles.niveauBtnActive]}
                    onPress={() => updateForm('niveau', n)}
                  >
                    <Text style={[styles.niveauText, form.niveau === n && styles.niveauTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.niveau && <Text style={styles.errorText}>{errors.niveau}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Minimum 8 caractères"
                  placeholderTextColor={COLORS.greyDark}
                  value={form.password}
                  onChangeText={(v) => updateForm('password', v)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={[styles.input, errors.password_confirmation && styles.inputError]}
                placeholder="Répétez le mot de passe"
                placeholderTextColor={COLORS.greyDark}
                value={form.password_confirmation}
                onChangeText={(v) => updateForm('password_confirmation', v)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              {errors.password_confirmation && <Text style={styles.errorText}>{errors.password_confirmation}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.registerBtnText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('LoginEtudiant')}>
              <Text style={styles.loginText}>
                Déjà un compte ? <Text style={styles.loginTextBold}>Se connecter</Text>
              </Text>
            </TouchableOpacity>

            {/* Support */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportTitle}>🆘 Problème lors de l'inscription ?</Text>
              <Text style={styles.supportSubtitle}>
                Email universitaire non reconnu ou autre problème ? Contactez-nous directement :
              </Text>
              <View style={styles.supportRow}>
                <TouchableOpacity
                  style={styles.supportBtn}
                  onPress={() => Linking.openURL('mailto:kabdourahmane00@gmail.com?subject=Support Inscription SunuThérapie')}
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
  logoContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 65, height: 65 },
  logoSeparator: { marginHorizontal: 10 },
  logoX: { fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.primaryLight },
  form: { padding: 24, paddingTop: 24, paddingBottom: 40 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text },
  inputError: { borderColor: COLORS.danger },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeIcon: { fontSize: 18 },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  hintText: { color: COLORS.greyDark, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  niveauxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  niveauBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#D4EDED', backgroundColor: COLORS.white },
  niveauBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  niveauText: { fontSize: 13, color: COLORS.text },
  niveauTextActive: { color: COLORS.white, fontWeight: 'bold' },
  registerBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  registerBtnDisabled: { backgroundColor: COLORS.greyDark },
  registerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: COLORS.textMuted },
  loginTextBold: { color: COLORS.primary, fontWeight: 'bold' },
  supportContainer: { marginTop: 30, alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  supportTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.greyDark, marginBottom: 6, textAlign: 'center' },
  supportSubtitle: { fontSize: 12, color: COLORS.greyDark, marginBottom: 12, textAlign: 'center', paddingHorizontal: 10 },
  supportRow: { flexDirection: 'row', gap: 10 },
  supportBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#D4EDED', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  supportBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
});
