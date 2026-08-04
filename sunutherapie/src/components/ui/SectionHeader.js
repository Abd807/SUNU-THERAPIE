import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../config/theme';

export default function SectionHeader({ title, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '600', color: colors.primary, marginRight: 2 },
});
