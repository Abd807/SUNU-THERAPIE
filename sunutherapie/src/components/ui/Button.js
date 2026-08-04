import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../config/theme';

const VARIANTS = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  secondary: { bg: colors.accent, fg: colors.white, border: colors.accent },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  ghost: { bg: colors.primaryLight, fg: colors.primaryDark, border: 'transparent' },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
};

const SIZES = {
  sm: { padV: 8, padH: 14, font: 13, icon: 16 },
  md: { padV: 13, padH: 18, font: 15, icon: 18 },
  lg: { padV: 16, padH: 22, font: 16, icon: 20 },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  full = false,
  style,
  textStyle,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border, paddingVertical: s.padV, paddingHorizontal: s.padH },
        full && styles.full,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={s.icon} color={v.fg} style={styles.iconLeft} /> : null}
          <Text style={[styles.label, { color: v.fg, fontSize: s.font }, textStyle]}>{label}</Text>
          {iconRight ? <Ionicons name={iconRight} size={s.icon} color={v.fg} style={styles.iconRight} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontWeight: '700' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
