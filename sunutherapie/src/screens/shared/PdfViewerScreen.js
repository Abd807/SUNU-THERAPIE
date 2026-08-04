import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { colors, spacing } from '../../config/theme';

export default function PdfViewerScreen({ route, navigation }) {
  const { url, title } = route.params || {};
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [error, setError] = useState(null);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Lecture'}</Text>
          {pages > 0 ? <Text style={styles.sub}>Page {page} / {pages}</Text> : null}
        </View>
      </View>

      {!url ? (
        <View style={styles.center}>
          <Ionicons name="document-outline" size={40} color={colors.textFaint} />
          <Text style={styles.errText}>Aucun document à afficher.</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.errText}>Impossible d'ouvrir le PDF.</Text>
          <Text style={styles.errSub}>{error}</Text>
        </View>
      ) : (
        <Pdf
          source={{ uri: url, cache: true }}
          onLoadComplete={(n) => setPages(n)}
          onPageChanged={(p) => setPage(p)}
          onError={(e) => setError(String(e?.message || e))}
          trustAllCerts={false}
          enablePaging={false}
          style={styles.pdf}
          renderActivityIndicator={() => <ActivityIndicator size="large" color={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  title: { color: colors.white, fontSize: 17, fontWeight: '700' },
  sub: { color: colors.primaryLight, fontSize: 12, marginTop: 2 },
  pdf: { flex: 1, width: '100%', backgroundColor: colors.surfaceAlt },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  errText: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center' },
  errSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
