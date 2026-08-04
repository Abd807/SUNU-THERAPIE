import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadows } from '../../config/theme';

export default function Card({
  children,
  style,
  onPress,
  padded = true,
  elevated = true,
  activeOpacity = 0.85,
  ...rest
}) {
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    elevated ? shadows.sm : styles.bordered,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} style={cardStyle} {...rest}>
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg },
  padded: { padding: spacing.lg },
  bordered: { borderWidth: 1, borderColor: colors.border },
});
