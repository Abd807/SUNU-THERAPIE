import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../config/theme';
import RessourcesScreen from './RessourcesScreen';
import NotesScreen from './NotesScreen';

export default function RessourcesNotesScreen() {
  const [onglet, setOnglet] = useState('ressources');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{onglet === 'ressources' ? 'Ressources' : 'Notes'}</Text>
      </View>

      <View style={styles.segment}>
        {[
          { key: 'ressources', label: 'Ressources', icon: 'library' },
          { key: 'notes', label: 'Notes', icon: 'document-text' },
        ].map((s) => {
          const active = onglet === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              onPress={() => setOnglet(s.key)}
              activeOpacity={0.85}
            >
              <Ionicons name={active ? s.icon : `${s.icon}-outline`} size={16} color={active ? colors.white : colors.textMuted} />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {onglet === 'ressources' ? <RessourcesScreen hideHeader /> : <NotesScreen hideHeader />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.full, padding: 4, marginHorizontal: spacing.lg, marginTop: spacing.lg },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radius.full },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  segmentTextActive: { color: colors.white },
  content: { flex: 1 },
});
