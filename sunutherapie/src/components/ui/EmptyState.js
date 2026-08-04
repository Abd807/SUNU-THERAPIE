import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../config/theme';
import Button from './Button';

export default function EmptyState({
  icon = 'sparkles-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 19 },
  btn: { marginTop: spacing.lg },
});
