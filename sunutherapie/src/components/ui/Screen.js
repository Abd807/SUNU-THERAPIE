import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../config/theme';

// Conteneur d'écran standard : gère la safe area, le fond et le scroll optionnel.
export default function Screen({
  children,
  scroll = false,
  style,
  contentStyle,
  refreshing,
  onRefresh,
  edges = ['top', 'left', 'right'],
  background = colors.background,
  barStyle = 'dark-content',
}) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: [styles.scrollContent, contentStyle],
        refreshControl: onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined,
      }
    : { style: [styles.flex, contentStyle] };

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: background }, style]}>
      <StatusBar barStyle={barStyle} />
      <Content {...contentProps}>{children}</Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
});
