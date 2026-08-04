import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../config/theme';

export default function Avatar({
  name,
  uri,
  size = 48,
  online = false,
  bg = colors.primaryLight,
  fg = colors.primaryDark,
  style,
}) {
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
          <Text style={{ color: fg, fontWeight: '700', fontSize: size * 0.4 }}>{initial}</Text>
        </View>
      )}
      {online ? <View style={styles.dot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  img: { resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.surface,
  },
});
