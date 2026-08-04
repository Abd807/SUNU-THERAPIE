import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../../config/theme';

const TONES = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
  primary: { bg: colors.primaryLight, fg: colors.primaryDark },
  success: { bg: colors.successLight, fg: colors.success },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
  info: { bg: colors.infoLight, fg: colors.info },
};

export default function Badge({ label, tone = 'neutral', dot = false, style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '700' },
});
