import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';
import {
  apiGetConsultationsPsy,
  apiAccepterConsultation,
  apiRefuserConsultation,
  apiTerminerConsultation,
  apiGetVideoToken,
} from '../../services/api';

export default function ConsultationsScreen({ navigation }) {
  const { userProfile, token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre, setFiltre] = useState('en_attente');

  const filtres = [
    { key: 'en_attente', label: '⏳ En attente' },
    { key: 'acceptee', label: '✅ Acceptées' },
    { key: 'terminee', label: '✔️ Terminées' },
    { key: 'all', label: '📋 Toutes' },
  ];

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
        if (res.success) { loadConsultations(); Alert.alert('✅', 'Consultation acceptée !'); }
      }},
    ]);
  };

  const handleRefuser = (id) => {
    Alert.alert('Refuser', 'Voulez-vous refuser cette demande ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Refuser', style: 'destructive', onPress: async () => {
        const res = await apiRefuserConsultation(id, 'Indisponibilité');
        if (res.success) { loadConsultations(); Alert.alert('❌', 'Consultation refusée'); }
      }},
    ]);
  };

  const handleTerminer = (id) => {
    Alert.alert('Terminer', 'Marquer cette consultation comme terminée ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Terminer', onPress: async () => {
        const res = await apiTerminerConsultation(id);
        if (res.success) { loadConsultations(); Alert.alert('✔️', 'Consultation terminée !'); }
      }},
    ]);
  };

  const handleDemarrerAppel = async (consultation) => {
    try {
      const res = await apiGetVideoToken(consultation.id);
      if (!res.success) {
        Alert.alert('Erreur', res.message || 'Impossible de démarrer l\'appel');
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
    : consultations.filter(c => c.statut === filtre);

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente': return COLORS.warning;
      case 'acceptee': return COLORS.success;
      case 'terminee': return COLORS.greyDark;
      case 'refusee': return COLORS.danger;
      default: return COLORS.greyDark;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Mes Consultations</Text>
        <Text style={styles.headerSub}>{consultations.length} au total</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresContainer}>
        {filtres.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtreBtn, filtre === f.key && styles.filtreBtnActive]}
            onPress={() => setFiltre(f.key)}
          >
            <Text style={[styles.filtreText, filtre === f.key && styles.filtreTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadConsultations(); }} />}
        contentContainerStyle={styles.listContainer}
      >
        {consultationsFiltrees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucune consultation dans cette catégorie</Text>
          </View>
        ) : (
          consultationsFiltrees.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {c.etudiant?.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{c.etudiant?.user?.name || 'Étudiant'}</Text>
                  <Text style={styles.cardUniversite}>{c.etudiant?.universite} — {c.etudiant?.niveau}</Text>
                  <Text style={styles.cardDate}>
                    📅 {c.date_consultation
                      ? new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Date à confirmer'}
                  </Text>
                </View>
                <View style={[styles.statutBadge, { backgroundColor: getStatutColor(c.statut) + '20' }]}>
                  <Text style={[styles.statutText, { color: getStatutColor(c.statut) }]}>
                    {c.statut === 'en_attente' ? '⏳' : c.statut === 'acceptee' ? '✅' : c.statut === 'terminee' ? '✔️' : '❌'}
                  </Text>
                </View>
              </View>

              {c.motif ? (
                <View style={styles.motifContainer}>
                  <Text style={styles.motifLabel}>Motif :</Text>
                  <Text style={styles.motifText}>{c.motif}</Text>
                </View>
              ) : null}

              {/* Actions en attente */}
              {c.statut === 'en_attente' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAccepter(c.id)}>
                    <Text style={styles.actionBtnText}>✅ Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.refuserBtn]} onPress={() => handleRefuser(c.id)}>
                    <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>❌ Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Actions acceptée */}
              {c.statut === 'acceptee' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.videoBtn]}
                    onPress={() => handleDemarrerAppel(c)}
                  >
                    <Text style={styles.videoBtnText}>📹 Démarrer l'appel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.terminerBtn]}
                    onPress={() => handleTerminer(c.id)}
                  >
                    <Text style={styles.actionBtnText}>✔️ Terminer</Text>
                  </TouchableOpacity>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.secondary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  filtresContainer: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
  filtreBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  filtreBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  filtreText: { fontSize: 13, color: COLORS.greyDark, fontWeight: '600' },
  filtreTextActive: { color: COLORS.white },
  listContainer: { paddingHorizontal: 16, paddingTop: 8 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.greyDark, textAlign: 'center' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  cardUniversite: { fontSize: 12, color: COLORS.greyDark, marginTop: 2 },
  cardDate: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  statutBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statutText: { fontSize: 16 },
  motifContainer: { marginTop: 12, padding: 10, backgroundColor: COLORS.background, borderRadius: 8 },
  motifLabel: { fontSize: 12, color: COLORS.greyDark, fontWeight: '600' },
  motifText: { fontSize: 13, color: COLORS.text, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#E8F5E9' },
  refuserBtn: { backgroundColor: '#FFEBEE' },
  terminerBtn: { backgroundColor: '#E3F2FD' },
  videoBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: COLORS.success },
  actionBtnText: { fontSize: 13, fontWeight: 'bold', color: COLORS.success },
  videoBtnText: { fontSize: 13, fontWeight: 'bold', color: COLORS.success },
});
