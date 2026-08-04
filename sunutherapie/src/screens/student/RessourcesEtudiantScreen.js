import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiGetRessources, apiGetBibliotheque } from '../../services/api';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Badge, EmptyState } from '../../components/ui';

const CATEGORIES = [
  { key: 'anxiete', label: 'Anxiété' },
  { key: 'depression', label: 'Dépression' },
  { key: 'stress', label: 'Stress' },
  { key: 'sommeil', label: 'Sommeil' },
  { key: 'confiance', label: 'Confiance' },
  { key: 'deuil', label: 'Deuil' },
  { key: 'autre', label: 'Autre' },
];

const TYPES_BIBLIO = [
  { key: 'all', label: 'Tout' },
  { key: 'livre', label: 'Livres' },
  { key: 'video', label: 'Vidéos' },
];

const getTypeIcon = (type) => {
  if (type === 'note') return 'document-text-outline';
  if (type === 'pdf') return 'document-outline';
  return 'videocam-outline';
};
const getCategorieLabel = (cat) => CATEGORIES.find((c) => c.key === cat)?.label || cat;

export default function RessourcesEtudiantScreen({ navigation }) {
  const [section, setSection] = useState('bibliotheque'); // 'bibliotheque' | 'therapeute'
  const [biblio, setBiblio] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeBiblio, setTypeBiblio] = useState('all');
  const [filtreType, setFiltreType] = useState('all');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [bibRes, resRes] = await Promise.all([apiGetBibliotheque(), apiGetRessources()]);
      if (bibRes.success) setBiblio(bibRes.data || []);
      if (resRes.success) setRessources(resRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const biblioFiltree = typeBiblio === 'all' ? biblio : biblio.filter((b) => b.type === typeBiblio);
  const ressourcesFiltrees = filtreType === 'all' ? ressources : ressources.filter((r) => r.categorie === filtreType);

  const openBiblio = (item) => {
    if (item.type === 'livre') {
      const pdf = item.fichier_url || item.url;
      if (pdf) navigation.navigate('PdfViewer', { url: pdf, title: item.titre });
    } else {
      const link = item.url || item.fichier_url;
      if (link) Linking.openURL(link);
    }
  };

  const openRessource = (r) => {
    if (r.type === 'pdf' && r.url) navigation.navigate('PdfViewer', { url: r.url, title: r.titre });
    else if (r.url) Linking.openURL(r.url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ressources</Text>
        <Text style={styles.headerSub}>
          {section === 'bibliotheque'
            ? `${biblio.length} livre(s) & vidéo(s)`
            : `${ressources.length} ressource(s) de votre thérapeute`}
        </Text>
      </View>

      {/* Sélecteur de section */}
      <View style={styles.segment}>
        {[
          { key: 'bibliotheque', label: 'Bibliothèque', icon: 'library' },
          { key: 'therapeute', label: 'Mon thérapeute', icon: 'medkit' },
        ].map((s) => {
          const active = section === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              onPress={() => setSection(s.key)}
              activeOpacity={0.85}
            >
              <Ionicons name={active ? s.icon : `${s.icon}-outline`} size={16} color={active ? colors.white : colors.textMuted} />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filtres */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtresContainer}>
          {section === 'bibliotheque'
            ? TYPES_BIBLIO.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.filtreBtn, typeBiblio === t.key && styles.filtreBtnActive]}
                  onPress={() => setTypeBiblio(t.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filtreText, typeBiblio === t.key && styles.filtreTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))
            : (
              <>
                <TouchableOpacity
                  style={[styles.filtreBtn, filtreType === 'all' && styles.filtreBtnActive]}
                  onPress={() => setFiltreType('all')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filtreText, filtreType === 'all' && styles.filtreTextActive]}>Tout</Text>
                </TouchableOpacity>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.filtreBtn, filtreType === c.key && styles.filtreBtnActive]}
                    onPress={() => setFiltreType(c.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filtreText, filtreType === c.key && styles.filtreTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.listContainer}
      >
        {section === 'bibliotheque' ? (
          biblioFiltree.length === 0 ? (
            <EmptyState
              icon="library-outline"
              title="Bibliothèque vide"
              subtitle="Aucun livre ou vidéo n'est disponible pour le moment. Revenez bientôt."
              style={{ marginTop: spacing.xl }}
            />
          ) : (
            biblioFiltree.map((b) => (
              <Card key={b.id} style={styles.biblioCard} onPress={() => openBiblio(b)}>
                <View style={styles.biblioRow}>
                  {b.couverture_url ? (
                    <Image source={{ uri: b.couverture_url }} style={styles.cover} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cover, styles.coverFallback]}>
                      <Ionicons name={b.type === 'video' ? 'videocam' : 'book'} size={26} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.biblioInfo}>
                    <Badge label={b.type === 'video' ? 'Vidéo' : 'Livre'} tone={b.type === 'video' ? 'danger' : 'warning'} />
                    <Text style={styles.biblioTitre} numberOfLines={2}>{b.titre}</Text>
                    {b.auteur ? <Text style={styles.biblioAuteur}>{b.auteur}</Text> : null}
                    {b.description ? <Text style={styles.biblioDesc} numberOfLines={2}>{b.description}</Text> : null}
                    <View style={styles.openRow}>
                      <Ionicons name={b.type === 'video' ? 'play-circle' : 'open-outline'} size={15} color={colors.primary} />
                      <Text style={styles.openRowText}>{b.type === 'video' ? 'Regarder' : 'Ouvrir / Lire'}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))
          )
        ) : (
          ressourcesFiltrees.length === 0 ? (
            <EmptyState
              icon="medkit-outline"
              title="Aucune ressource"
              subtitle="Votre psychothérapeute n'a pas encore partagé de ressources avec vous."
              style={{ marginTop: spacing.xl }}
            />
          ) : (
            ressourcesFiltrees.map((r) => (
              <Card key={r.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeIcon}>
                    <Ionicons name={getTypeIcon(r.type)} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitre}>{r.titre}</Text>
                    <View style={styles.metaRow}>
                      <Badge label={getCategorieLabel(r.categorie)} tone="primary" />
                    </View>
                    <View style={styles.psyRow}>
                      <Ionicons name="medkit-outline" size={13} color={colors.accent} />
                      <Text style={styles.cardPsy}>Dr. {r.psychologue?.user?.name || 'Psychothérapeute'}</Text>
                    </View>
                    {r.description ? <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text> : null}
                  </View>
                </View>

                {r.url ? (
                  <TouchableOpacity style={styles.openBtn} onPress={() => openRessource(r)} activeOpacity={0.85}>
                    <Ionicons name="open-outline" size={16} color={colors.primary} />
                    <Text style={styles.openBtnText}>Ouvrir la ressource</Text>
                  </TouchableOpacity>
                ) : null}

                {r.type === 'note' && r.description ? (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>{r.description}</Text>
                  </View>
                ) : null}
              </Card>
            ))
          )
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSub: { fontSize: 13, color: colors.primaryLight, marginTop: 4 },

  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.full, padding: 4, marginHorizontal: spacing.lg, marginTop: spacing.lg },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radius.full },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  segmentTextActive: { color: colors.white },

  filtresContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filtreBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtreText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  filtreTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },

  // Bibliothèque
  biblioCard: { marginBottom: spacing.md },
  biblioRow: { flexDirection: 'row' },
  cover: { width: 72, height: 96, borderRadius: radius.md, marginRight: spacing.md, backgroundColor: colors.surfaceAlt },
  coverFallback: { alignItems: 'center', justifyContent: 'center' },
  biblioInfo: { flex: 1 },
  biblioTitre: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 6 },
  biblioAuteur: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  biblioDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  openRowText: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  // Ressources thérapeute
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  typeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardInfo: { flex: 1 },
  cardTitre: { fontSize: 15, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', marginTop: 6 },
  psyRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  cardPsy: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  cardDesc: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 18 },
  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primaryLight, padding: 12, borderRadius: radius.md, marginTop: spacing.md },
  openBtnText: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  noteContainer: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginTop: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  noteText: { fontSize: 13, color: colors.text, lineHeight: 20 },
});
