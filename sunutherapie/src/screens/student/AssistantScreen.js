import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiAssistantChat } from '../../services/api';
import { COLORS } from '../../config/constants';

export default function AssistantScreen({ navigation }) {
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
      const reply = res.reply || "Je ne peux pas répondre pour le moment.";
      setMessages((prev) => [...prev, { from: 'bot', text: reply, crisis: res.crisis === true }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        from: 'bot',
        text: "Erreur réseau. Réessaie, ou contacte directement un psychologue de la plateforme.",
        crisis: false,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
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
          contentContainerStyle={{ padding: 16 }}
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
              {m.crisis && <Text style={styles.crisisLabel}>⚠️ Ressources d'aide</Text>}
              <Text style={[styles.bubbleText, m.from === 'user' && { color: COLORS.white }]}>
                {m.text}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Écris ton message…"
            placeholderTextColor={COLORS.greyDark}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={envoyer} disabled={loading}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  backIcon: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.primaryLight, fontSize: 13, marginTop: 2 },
  messages: { flex: 1 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 10 },
  bubbleUser: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: COLORS.white, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleCrisis: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: COLORS.warning },
  crisisLabel: { color: COLORS.warning, fontWeight: '700', marginBottom: 6, fontSize: 13 },
  bubbleText: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  inputRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 28,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.grey, alignItems: 'flex-end',
  },
  input: {
    flex: 1, maxHeight: 100, backgroundColor: COLORS.background, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: COLORS.text,
  },
  sendBtn: {
    marginLeft: 8, backgroundColor: COLORS.primary, width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: COLORS.white, fontSize: 18 },
});
