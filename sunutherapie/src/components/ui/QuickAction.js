import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows } from '../../config/theme';

// Tuile d'action rapide (icône + libellé) — utilisée en grille sur l'accueil.
export default function QuickAction({
  icon,
  label,
  onPress,
  tint = colors.primary,
  tintBg = colors.primaryLight,
  style,
}) {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, alignItems: 'center', ...shadows.sm,
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', marginBottom: spacing.sm,
  },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
