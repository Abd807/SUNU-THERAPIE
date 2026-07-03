import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Image, Linking, ScrollView,
} from 'react-native';
import { COLORS, API_URL } from '../../config/constants';

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
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Erreur', 'Entrez le code complet à 6 chiffres');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert(
          '✅ Compte vérifié !',
          'Votre compte est maintenant actif. Vous pouvez vous connecter.',
          [{ text: 'Se connecter', onPress: () => navigation.navigate('LoginEtudiant') }]
        );
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
        Alert.alert('✅ Code renvoyé', 'Un nouveau code a été envoyé à votre email.');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>✉️ Vérification email</Text>
          <Text style={styles.subtitle}>Un code a été envoyé à</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Entrez le code à 6 chiffres</Text>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => inputs.current[index] = ref}
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

          <Text style={styles.hintText}>⏱ Le code expire dans 10 minutes</Text>

          <TouchableOpacity
            style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.verifyBtnText}>Vérifier mon compte</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.resendText}>
                Pas reçu le code ? <Text style={styles.resendTextBold}>Renvoyer</Text>
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.backText}>← Modifier mon email</Text>
          </TouchableOpacity>

          {/* Bloc OTP non reçu */}
          <View style={styles.otpAlert}>
            <Text style={styles.otpAlertTitle}>📩 Vous n'avez pas reçu le code ?</Text>
            <Text style={styles.otpAlertText}>
              • Vérifiez votre dossier <Text style={styles.otpBold}>Spam / Courrier indésirable</Text>{'\n'}
              • Cliquez sur <Text style={styles.otpBold}>"Renvoyer"</Text> ci-dessus et attendez quelques minutes{'\n'}
              • Si le problème persiste, contactez-nous en indiquant votre email <Text style={styles.otpBold}>{email}</Text>
            </Text>
            <View style={styles.supportRow}>
              <TouchableOpacity
                style={styles.supportBtn}
                onPress={() => Linking.openURL(`mailto:kabdourahmane00@gmail.com?subject=Code OTP non reçu SunuThérapie&body=Bonjour, je n'ai pas reçu mon code OTP. Mon email : ${email}`)}
              >
                <Text style={styles.supportBtnText}>📧 Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.supportBtn}
                onPress={() => Linking.openURL(`https://wa.me/221784852249?text=Bonjour%2C%20je%20n%27ai%20pas%20re%C3%A7u%20mon%20code%20OTP%20SunuTh%C3%A9rapie.%20Mon%20email%20:%20${encodeURIComponent(email)}`)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logoContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logo: { width: 65, height: 65 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
  subtitle: { fontSize: 13, color: COLORS.primaryLight },
  email: { fontSize: 14, color: COLORS.white, fontWeight: 'bold', marginTop: 4 },
  form: { padding: 24, paddingTop: 32, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  codeInput: { width: 48, height: 56, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 12, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: COLORS.text, backgroundColor: COLORS.white },
  codeInputFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  hintText: { textAlign: 'center', color: COLORS.greyDark, fontSize: 12, marginBottom: 24, fontStyle: 'italic' },
  verifyBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  verifyBtnDisabled: { backgroundColor: COLORS.greyDark },
  verifyBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  resendBtn: { alignItems: 'center', marginBottom: 16 },
  resendText: { fontSize: 14, color: COLORS.textMuted },
  resendTextBold: { color: COLORS.primary, fontWeight: 'bold' },
  backLink: { alignItems: 'center', marginBottom: 30 },
  backText: { fontSize: 13, color: COLORS.greyDark },
  otpAlert: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 16 },
  otpAlertTitle: { fontSize: 13, fontWeight: 'bold', color: '#F57F17', marginBottom: 10, textAlign: 'center' },
  otpAlertText: { fontSize: 12, color: '#5D4037', lineHeight: 20, marginBottom: 14 },
  otpBold: { fontWeight: 'bold' },
  supportRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  supportBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#FFE082', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  supportBtnText: { fontSize: 12, color: '#5D4037', fontWeight: '600' },
});
