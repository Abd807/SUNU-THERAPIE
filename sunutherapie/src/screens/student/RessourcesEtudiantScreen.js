import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Linking, RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';
import { apiGetRessources } from '../../services/api';

const CATEGORIES = [
  { key: 'anxiete', label: '😰 Anxiété' },
  { key: 'depression', label: '😔 Dépression' },
  { key: 'stress', label: '😤 Stress' },
  { key: 'sommeil', label: '😴 Sommeil' },
  { key: 'confiance', label: '💪 Confiance' },
  { key: 'deuil', label: '🕊️ Deuil' },
  { key: 'autre', label: '📌 Autre' },
];

export default function RessourcesEtudiantScreen() {
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtreType, setFiltreType] = useState('all');

  useEffect(() => { loadRessources(); }, []);

  const loadRessources = async () => {
    try {
      const res = await apiGetRessources();
      if (res.success) setRessources(res.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'note') return '📝';
    if (type === 'pdf') return '📄';
    return '🎥';
  };

  const getCategorieLabel = (cat) => CATEGORIES.find(c => c.key === cat)?.label || cat;

  const ressourcesFiltrees = filtreType === 'all'
    ? ressources
    : ressources.filter(r => r.categorie === filtreType);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Ressources</Text>
        <Text style={styles.headerSub}>{ressources.length} ressource(s) partagée(s)</Text>
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresContainer}>
        <TouchableOpacity
          style={[styles.filtreBtn, filtreType === 'all' && styles.filtreBtnActive]}
          onPress={() => setFiltreType('all')}
        >
          <Text style={[styles.filtreText, filtreType === 'all' && styles.filtreTextActive]}>📋 Tout</Text>
        </TouchableOpacity>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.key}
            style={[styles.filtreBtn, filtreType === c.key && styles.filtreBtnActive]}
            onPress={() => setFiltreType(c.key)}
          >
            <Text style={[styles.filtreText, filtreType === c.key && styles.filtreTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRessources(); }} />}
        contentContainerStyle={styles.listContainer}
      >
        {ressourcesFiltrees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune ressource</Text>
            <Text style={styles.emptyText}>
              Votre psychothérapeute n'a pas encore partagé de ressources avec vous.
            </Text>
          </View>
        ) : (
          ressourcesFiltrees.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeIconContainer}>
                  <Text style={styles.typeIcon}>{getTypeIcon(r.type)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitre}>{r.titre}</Text>
                  <Text style={styles.cardCategorie}>{getCategorieLabel(r.categorie)}</Text>
                  <Text style={styles.cardPsy}>
                    👨‍⚕️ Dr. {r.psychologue?.user?.name || 'Psychothérapeute'}
                  </Text>
                  {r.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text>
                  ) : null}
                </View>
              </View>

              {r.url && (
                <TouchableOpacity
                  style={styles.openBtn}
                  onPress={() => Linking.openURL(r.url)}
                >
                  <Text style={styles.openBtnText}>🔗 Ouvrir la ressource</Text>
                </TouchableOpacity>
              )}

              {r.type === 'note' && r.description && (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>{r.description}</Text>
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSub: { fontSize: 13, color: COLORS.primaryLight, marginTop: 4 },
  filtresContainer: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  filtreBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filtreText: { fontSize: 12, color: COLORS.greyDark, fontWeight: '600' },
  filtreTextActive: { color: COLORS.white },
  listContainer: { paddingHorizontal: 16, paddingTop: 8 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: COLORS.greyDark, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  typeIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  typeIcon: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardTitre: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  cardCategorie: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  cardPsy: { fontSize: 12, color: COLORS.secondary, marginTop: 2 },
  cardDesc: { fontSize: 12, color: COLORS.greyDark, marginTop: 4, lineHeight: 18 },
  openBtn: { backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  openBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  noteContainer: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, marginTop: 12, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  noteText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
});
