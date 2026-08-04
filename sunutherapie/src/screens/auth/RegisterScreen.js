import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Image, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../config/theme';
import { Button } from '../../components/ui';

const DOMAINES_AUTORISES = [
  '@ucad.edu.sn', '@ugb.edu.sn', '@univ-thies.sn', '@unstim.sn', '@zig.univ.sn', '@uadb.edu.sn', '@gmail.com',
];

const SUPPORTS = [
  { icon: 'mail-outline', label: 'Email', url: 'mailto:kabdourahmane00@gmail.com?subject=Support Inscription SunuThérapie' },
  { icon: 'logo-whatsapp', label: 'WhatsApp', url: 'https://wa.me/221784852249' },
  { icon: 'call-outline', label: 'Appeler', url: 'tel:+221784852249' },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '', telephone: '', email: '', password: '', password_confirmation: '',
    numero_carte_etudiant: '', universite: 'UCAD', faculte: '', niveau: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'];

  const updateForm = (key, value) => { setForm({ ...form, [key]: value }); setErrors({ ...errors, [key]: null }); };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nom requis';
    if (!form.telephone.trim()) newErrors.telephone = 'Téléphone requis';
    if (!form.email.trim()) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide';
    else if (!DOMAINES_AUTORISES.some((d) => form.email.toLowerCase().endsWith(d))) newErrors.email = 'Utilisez votre email universitaire officiel (ex: @ucad.edu.sn)';
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
          Object.keys(result.errors).forEach((key) => { apiErrors[key] = result.errors[key][0]; });
          setErrors(apiErrors);
        } else {
          Alert.alert('Erreur', result.message || 'Erreur lors de la création du compte');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
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
            <View style={styles.logosRow}>
              <View style={styles.logoContainer}><Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" /></View>
              <Text style={styles.logoX}>×</Text>
              <View style={styles.logoContainer}><Image source={require('../../../assets/images/Logoucad.png')} style={styles.logo} resizeMode="contain" /></View>
            </View>
            <View style={styles.titleRow}>
              <Ionicons name="school" size={18} color={colors.white} />
              <Text style={styles.title}>Créer un compte</Text>
            </View>
            <Text style={styles.subtitle}>Rejoignez SunuThérapie</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="Prénom et Nom" placeholderTextColor={colors.textFaint} value={form.name} onChangeText={(v) => updateForm('name', v)} editable={!loading} />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput style={[styles.input, errors.telephone && styles.inputError]} placeholder="Ex: 77 XXX XX XX" placeholderTextColor={colors.textFaint} value={form.telephone} onChangeText={(v) => updateForm('telephone', v)} keyboardType="phone-pad" editable={!loading} />
              {errors.telephone ? <Text style={styles.errorText}>{errors.telephone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse email universitaire</Text>
              <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="exemple@ucad.edu.sn" placeholderTextColor={colors.textFaint} value={form.email} onChangeText={(v) => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : <Text style={styles.hintText}>Domaines acceptés : @ucad.edu.sn, @ugb.edu.sn…</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro carte étudiant</Text>
              <TextInput style={[styles.input, errors.numero_carte_etudiant && styles.inputError]} placeholder="Ex: 20XXXXXXX" placeholderTextColor={colors.textFaint} value={form.numero_carte_etudiant} onChangeText={(v) => updateForm('numero_carte_etudiant', v)} editable={!loading} />
              {errors.numero_carte_etudiant ? <Text style={styles.errorText}>{errors.numero_carte_etudiant}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Faculté</Text>
              <TextInput style={[styles.input, errors.faculte && styles.inputError]} placeholder="Ex: Lettres, Sciences, Médecine…" placeholderTextColor={colors.textFaint} value={form.faculte} onChangeText={(v) => updateForm('faculte', v)} editable={!loading} />
              {errors.faculte ? <Text style={styles.errorText}>{errors.faculte}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Niveau</Text>
              <View style={styles.niveauxRow}>
                {niveaux.map((n) => (
                  <TouchableOpacity key={n} style={[styles.niveauBtn, form.niveau === n && styles.niveauBtnActive]} onPress={() => updateForm('niveau', n)} activeOpacity={0.8}>
                    <Text style={[styles.niveauText, form.niveau === n && styles.niveauTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.niveau ? <Text style={styles.errorText}>{errors.niveau}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={[styles.input, styles.passwordInput, errors.password && styles.inputError]} placeholder="Minimum 8 caractères" placeholderTextColor={colors.textFaint} value={form.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry={!showPassword} editable={!loading} />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput style={[styles.input, errors.password_confirmation && styles.inputError]} placeholder="Répétez le mot de passe" placeholderTextColor={colors.textFaint} value={form.password_confirmation} onChangeText={(v) => updateForm('password_confirmation', v)} secureTextEntry={!showPassword} editable={!loading} />
              {errors.password_confirmation ? <Text style={styles.errorText}>{errors.password_confirmation}</Text> : null}
            </View>

            <Button label="Créer mon compte" onPress={handleRegister} loading={loading} full size="lg" style={{ marginTop: spacing.sm }} />

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('LoginEtudiant')}>
              <Text style={styles.loginText}>Déjà un compte ? <Text style={styles.loginTextBold}>Se connecter</Text></Text>
            </TouchableOpacity>

            <View style={styles.supportContainer}>
              <Text style={styles.supportTitle}>Problème lors de l'inscription ?</Text>
              <Text style={styles.supportSubtitle}>Email universitaire non reconnu ou autre souci ? Contactez-nous :</Text>
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
  logosRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  logoContainer: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.white, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 62, height: 62 },
  logoX: { fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 13, color: colors.primaryLight, marginTop: 4 },
  form: { padding: spacing.xxl, paddingBottom: spacing.huge },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text },
  inputError: { borderColor: colors.danger },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  hintText: { color: colors.textFaint, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  niveauxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  niveauBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  niveauBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  niveauText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  niveauTextActive: { color: colors.white },
  loginLink: { alignItems: 'center', marginTop: spacing.xl },
  loginText: { fontSize: 14, color: colors.textMuted },
  loginTextBold: { color: colors.primary, fontWeight: '700' },
  supportContainer: { marginTop: spacing.xxxl, alignItems: 'center', paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  supportTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 4, textAlign: 'center' },
  supportSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md, textAlign: 'center', paddingHorizontal: 10 },
  supportRow: { flexDirection: 'row', gap: spacing.sm },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  supportBtnText: { fontSize: 13, color: colors.text, fontWeight: '600' },
});
