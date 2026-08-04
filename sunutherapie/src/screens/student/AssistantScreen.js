import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiAssistantChat } from '../../services/api';
import { colors, spacing, radius } from '../../config/theme';

export default function AssistantScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Bonjour 👋 Je suis là pour t'écouter et t'orienter. Comment te sens-tu aujourd'hui ?",
      crisis: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const envoyer = async () => {
    const texte = input.trim();
    if (!texte || loading) return;

    setMessages((prev) => [...prev, { from: 'user', text: texte }]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiAssistantChat(texte);
      const reply = res.reply || 'Je ne peux pas répondre pour le moment.';
      setMessages((prev) => [...prev, { from: 'bot', text: reply, crisis: res.crisis === true }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        from: 'bot',
        text: 'Erreur réseau. Réessaie, ou contacte directement un psychologue de la plateforme.',
        crisis: false,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Assistant SunuThérapie</Text>
          <Text style={styles.headerSub}>Écoute et orientation — confidentiel</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ padding: spacing.lg }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.from === 'user' ? styles.bubbleUser : styles.bubbleBot,
                m.crisis && styles.bubbleCrisis,
              ]}
            >
              {m.crisis ? (
                <View style={styles.crisisRow}>
                  <Ionicons name="alert-circle" size={15} color={colors.warning} />
                  <Text style={styles.crisisLabel}>Ressources d'aide</Text>
                </View>
              ) : null}
              <Text style={[styles.bubbleText, m.from === 'user' && { color: colors.white }]}>{m.text}</Text>
            </View>
          ))}
          {loading ? (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.input}
            placeholder="Écris ton message…"
            placeholderTextColor={colors.textFaint}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={envoyer}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  headerIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  headerSub: { color: colors.primaryLight, fontSize: 12, marginTop: 2 },
  messages: { flex: 1 },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md },
  bubbleUser: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleCrisis: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  crisisRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  crisisLabel: { color: colors.warning, fontWeight: '700', fontSize: 13 },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  inputRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
  input: { flex: 1, maxHeight: 100, backgroundColor: colors.surfaceAlt, borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: 10, fontSize: 15, color: colors.text },
  sendBtn: { marginLeft: spacing.sm, backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});
