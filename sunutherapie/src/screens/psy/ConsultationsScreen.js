import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Avatar, Badge, Button, EmptyState } from '../../components/ui';
import {
  apiGetConsultationsPsy,
  apiAccepterConsultation,
  apiRefuserConsultation,
  apiTerminerConsultation,
  apiGetVideoToken,
} from '../../services/api';

const STATUTS = {
  en_attente: { tone: 'warning', label: 'En attente' },
  acceptee: { tone: 'success', label: 'Acceptée' },
  terminee: { tone: 'neutral', label: 'Terminée' },
  refusee: { tone: 'danger', label: 'Refusée' },
};

const FILTRES = [
  { key: 'en_attente', label: 'En attente' },
  { key: 'acceptee', label: 'Acceptées' },
  { key: 'terminee', label: 'Terminées' },
  { key: 'all', label: 'Toutes' },
];

export default function ConsultationsScreen({ navigation }) {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre, setFiltre] = useState('en_attente');

  useEffect(() => { loadConsultations(); }, []);

  const loadConsultations = async () => {
    try {
      const res = await apiGetConsultationsPsy();
      if (res.success) setConsultations(res.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccepter = (id) => {
    Alert.alert('Accepter', 'Voulez-vous accepter cette consultation ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Accepter', onPress: async () => {
        const res = await apiAccepterConsultation(id);
        if (res.success) { loadConsultations(); Alert.alert('Accepté', 'Consultation acceptée !'); }
      } },
    ]);
  };

  const handleRefuser = (id) => {
    Alert.alert('Refuser', 'Voulez-vous refuser cette demande ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Refuser', style: 'destructive', onPress: async () => {
        const res = await apiRefuserConsultation(id, 'Indisponibilité');
        if (res.success) { loadConsultations(); Alert.alert('Refusé', 'Consultation refusée'); }
      } },
    ]);
  };

  const handleTerminer = (id) => {
    Alert.alert('Terminer', 'Marquer cette consultation comme terminée ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Terminer', onPress: async () => {
        const res = await apiTerminerConsultation(id);
        if (res.success) { loadConsultations(); Alert.alert('Terminé', 'Consultation terminée !'); }
      } },
    ]);
  };

  const handleDemarrerAppel = async (consultation) => {
    try {
      const res = await apiGetVideoToken(consultation.id);
      if (!res.success) {
        Alert.alert('Erreur', res.message || "Impossible de démarrer l'appel");
        return;
      }
      navigation.navigate('VideoCall', {
        consultationId: consultation.id,
        channelName: res.channel_name,
        token: res.token,
        uid: res.uid,
        appId: res.app_id,
      });
    } catch (error) {
      console.error('Erreur token video:', error);
      Alert.alert('Erreur', 'Connexion impossible. Vérifiez votre internet.');
    }
  };

  const consultationsFiltrees = filtre === 'all'
    ? consultations
    : consultations.filter((c) => c.statut === filtre);

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
        <Text style={styles.headerTitle}>Mes Consultations</Text>
        <Text style={styles.headerSub}>{consultations.length} au total</Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtresContainer}>
          {FILTRES.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filtreBtn, filtre === f.key && styles.filtreBtnActive]}
              onPress={() => setFiltre(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filtreText, filtre === f.key && styles.filtreTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadConsultations(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.listContainer}
      >
        {consultationsFiltrees.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Aucune consultation" subtitle="Aucune consultation dans cette catégorie." style={{ marginTop: spacing.xl }} />
        ) : (
          consultationsFiltrees.map((c) => {
            const st = STATUTS[c.statut] || { tone: 'neutral', label: c.statut };
            return (
              <Card key={c.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Avatar name={c.etudiant?.user?.name} size={46} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{c.etudiant?.user?.name || 'Étudiant'}</Text>
                    {(c.etudiant?.universite || c.etudiant?.niveau) ? (
                      <Text style={styles.cardUniversite}>{[c.etudiant?.universite, c.etudiant?.niveau].filter(Boolean).join(' — ')}</Text>
                    ) : null}
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                      <Text style={styles.cardDate}>
                        {c.date_consultation
                          ? new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : 'Date à confirmer'}
                      </Text>
                    </View>
                  </View>
                  <Badge label={st.label} tone={st.tone} />
                </View>

                {c.motif ? (
                  <View style={styles.motifContainer}>
                    <Text style={styles.motifLabel}>Motif</Text>
                    <Text style={styles.motifText}>{c.motif}</Text>
                  </View>
                ) : null}

                {c.statut === 'en_attente' ? (
                  <View style={styles.actions}>
                    <Button label="Accepter" icon="checkmark" onPress={() => handleAccepter(c.id)} style={{ flex: 1 }} />
                    <Button label="Refuser" variant="danger" icon="close" onPress={() => handleRefuser(c.id)} style={{ flex: 1 }} />
                  </View>
                ) : null}

                {c.statut === 'acceptee' ? (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.videoBtn} onPress={() => handleDemarrerAppel(c)} activeOpacity={0.85}>
                      <Ionicons name="videocam" size={18} color={colors.white} />
                      <Text style={styles.videoBtnText}>Démarrer l'appel</Text>
                    </TouchableOpacity>
                    <Button label="Terminer" variant="outline" icon="flag" onPress={() => handleTerminer(c.id)} style={{ flex: 1 }} />
                  </View>
                ) : null}
              </Card>
            );
          })
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
  filtresContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  filtreBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filtreBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtreText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  filtreTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardUniversite: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  cardDate: { fontSize: 12, color: colors.primary },
  motifContainer: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.md },
  motifLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  motifText: { fontSize: 13, color: colors.text, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  videoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.success, borderRadius: radius.full, paddingVertical: 13 },
  videoBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
