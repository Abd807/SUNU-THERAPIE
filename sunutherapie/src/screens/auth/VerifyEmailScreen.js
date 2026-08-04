import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Linking, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Button } from '../../components/ui';

export default function VerifyEmailScreen({ navigation, route }) {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputs = useRef([]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) { Alert.alert('Erreur', 'Entrez le code complet à 6 chiffres'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Compte vérifié !', 'Votre compte est maintenant actif. Vous pouvez vous connecter.', [
          { text: 'Se connecter', onPress: () => navigation.navigate('LoginEtudiant') },
        ]);
      } else {
        Alert.alert('Code incorrect', data.message || 'Code invalide ou expiré');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await fetch(`${API_URL}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé à votre email.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors du renvoi');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Réessayez.');
    } finally {
      setResendLoading(false);
    }
  };

  const SUPPORTS = [
    { icon: 'mail-outline', label: 'Email', url: `mailto:kabdourahmane00@gmail.com?subject=Code OTP non reçu SunuThérapie&body=Bonjour, je n'ai pas reçu mon code OTP. Mon email : ${email}` },
    { icon: 'logo-whatsapp', label: 'WhatsApp', url: `https://wa.me/221784852249?text=${encodeURIComponent("Bonjour, je n'ai pas reçu mon code OTP SunuThérapie. Mon email : " + email)}` },
    { icon: 'call-outline', label: 'Appeler', url: 'tel:+221784852249' },
  ];

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.titleRow}>
            <Ionicons name="mail-open-outline" size={18} color={colors.white} />
            <Text style={styles.title}>Vérification email</Text>
          </View>
          <Text style={styles.subtitle}>Un code a été envoyé à</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Entrez le code à 6 chiffres</Text>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[styles.codeInput, digit && styles.codeInputFilled]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!loading}
              />
            ))}
          </View>

          <View style={styles.hintRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.hintText}>Le code expire dans 10 minutes</Text>
          </View>

          <Button label="Vérifier mon compte" onPress={handleVerify} loading={loading} full size="lg" style={{ marginTop: spacing.lg }} />

          <TouchableOpacity style={styles.resendBtn} onPress={handleResend} disabled={resendLoading}>
            {resendLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.resendText}>Pas reçu le code ? <Text style={styles.resendTextBold}>Renvoyer</Text></Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.backText}>← Modifier mon email</Text>
          </TouchableOpacity>

          <View style={styles.otpAlert}>
            <View style={styles.otpTitleRow}>
              <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
              <Text style={styles.otpAlertTitle}>Vous n'avez pas reçu le code ?</Text>
            </View>
            <Text style={styles.otpAlertText}>
              • Vérifiez votre dossier <Text style={styles.otpBold}>Spam / Courrier indésirable</Text>{'\n'}
              • Cliquez sur <Text style={styles.otpBold}>« Renvoyer »</Text> ci-dessus et patientez quelques minutes{'\n'}
              • Si le problème persiste, contactez-nous avec votre email <Text style={styles.otpBold}>{email}</Text>
            </Text>
            <View style={styles.supportRow}>
              {SUPPORTS.map((s) => (
                <TouchableOpacity key={s.label} style={styles.supportBtn} onPress={() => Linking.openURL(s.url)} activeOpacity={0.8}>
                  <Ionicons name={s.icon} size={16} color={colors.warning} />
                  <Text style={styles.supportBtnText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', backgroundColor: colors.primary, paddingVertical: spacing.xxxl, paddingTop: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  logoContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.white, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  logo: { width: 65, height: 65 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 20, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 13, color: colors.primaryLight, marginTop: 6 },
  email: { fontSize: 14, color: colors.white, fontWeight: '700', marginTop: 4 },
  form: { padding: spacing.xxl, paddingTop: spacing.xxxl, paddingBottom: spacing.huge },
  label: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.xl, textAlign: 'center' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  codeInput: { width: 48, height: 56, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, textAlign: 'center', fontSize: 22, fontWeight: '700', color: colors.text, backgroundColor: colors.surface },
  codeInputFilled: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: spacing.md },
  hintText: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  resendBtn: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  resendText: { fontSize: 14, color: colors.textMuted },
  resendTextBold: { color: colors.primary, fontWeight: '700' },
  backLink: { alignItems: 'center', marginBottom: spacing.xxl },
  backText: { fontSize: 13, color: colors.textMuted },
  otpAlert: { backgroundColor: colors.warningLight, borderWidth: 1, borderColor: colors.warning, borderRadius: radius.md, padding: spacing.lg },
  otpTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: spacing.md },
  otpAlertTitle: { fontSize: 13, fontWeight: '700', color: colors.warning },
  otpAlertText: { fontSize: 12, color: colors.text, lineHeight: 20, marginBottom: spacing.md },
  otpBold: { fontWeight: '700' },
  supportRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.warning, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  supportBtnText: { fontSize: 12, color: colors.text, fontWeight: '600' },
});
