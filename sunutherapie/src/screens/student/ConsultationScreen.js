import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius, shadows } from '../../config/theme';
import { Card, Avatar, Badge, Button, EmptyState } from '../../components/ui';
import {
  apiGetConsultationsEtudiant,
  apiGetPsychotherapeutesDisponibles,
  apiCreerConsultation,
  apiGetVideoToken,
} from '../../services/api';

const STATUTS = {
  en_attente: { tone: 'warning', label: 'En attente' },
  acceptee: { tone: 'success', label: 'Acceptée' },
  terminee: { tone: 'neutral', label: 'Terminée' },
  refusee: { tone: 'danger', label: 'Refusée' },
};

const FILTRES = [
  { key: 'all', label: 'Tout' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'acceptee', label: 'Acceptées' },
  { key: 'terminee', label: 'Terminées' },
];

export default function ConsultationScreen({ route, navigation }) {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [psyList, setPsyList] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtre, setFiltre] = useState('all');

  const [form, setForm] = useState({ psy_id: null, date: '', creneau: null, motif: '' });

  useEffect(() => {
    loadData();
    if (route?.params?.psyId) {
      setForm((f) => ({ ...f, psy_id: route.params.psyId }));
      setModalVisible(true);
    }
  }, []);

  const loadData = async () => {
    try {
      const [consultRes, psyRes] = await Promise.all([
        apiGetConsultationsEtudiant(),
        apiGetPsychotherapeutesDisponibles(),
      ]);
      if (consultRes.success) setConsultations(consultRes.data || []);
      if (psyRes.success) setPsyList(psyRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCreneaux = async (psyId, date) => {
    try {
      const res = await fetch(`${API_URL}/psychotherapeutes/${psyId}/creneaux/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCreneaux(data.data || []);
    } catch (error) {
      console.error('Erreur créneaux:', error);
    }
  };

  const handleDateSelect = (day) => {
    setForm({ ...form, date: day.dateString, creneau: null });
    if (form.psy_id) loadCreneaux(form.psy_id, day.dateString);
  };

  const handlePsySelect = (psyId) => {
    setForm({ ...form, psy_id: psyId, creneau: null });
    if (form.date) loadCreneaux(psyId, form.date);
  };

  const handleReserver = async () => {
    if (!form.psy_id) { Alert.alert('Erreur', 'Sélectionnez un psychothérapeute'); return; }
    if (!form.date) { Alert.alert('Erreur', 'Sélectionnez une date'); return; }
    if (!form.creneau) { Alert.alert('Erreur', 'Sélectionnez un créneau'); return; }

    setSaving(true);
    try {
      const res = await apiCreerConsultation({
        psychologue_id: form.psy_id,
        date_consultation: `${form.date} ${form.creneau.heure_debut}`,
        motif_consultation: form.motif,
        type: 'planifiee',
        mode: 'video',
      });

      if (res.success) {
        setModalVisible(false);
        setForm({ psy_id: null, date: '', creneau: null, motif: '' });
        loadData();
        Alert.alert('Demande envoyée !', 'Votre demande de consultation a été envoyée au psychothérapeute.');
      } else {
        Alert.alert('Erreur', res.message || 'Erreur lors de la réservation');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
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
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>RDV</Text>
        </TouchableOpacity>
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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.listContainer}
      >
        {consultationsFiltrees.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Aucune consultation"
            subtitle="Prenez un rendez-vous avec un psychothérapeute pour démarrer."
            actionLabel="Prendre un RDV"
            onAction={() => setModalVisible(true)}
            style={{ marginTop: spacing.xl }}
          />
        ) : (
          consultationsFiltrees.map((c) => {
            const st = STATUTS[c.statut] || { tone: 'neutral', label: c.statut };
            return (
              <Card key={c.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Avatar name={c.psychologue?.user?.name} size={46} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{c.psychologue?.user?.name}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                      <Text style={styles.cardDate}>
                        {c.date_consultation
                          ? new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : 'Date à confirmer'}
                      </Text>
                    </View>
                    {c.motif ? (
                      <View style={styles.metaRow}>
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textMuted} />
                        <Text style={styles.cardMotif}>{c.motif}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Badge label={st.label} tone={st.tone} />
                </View>

                {c.statut === 'acceptee' ? (
                  <TouchableOpacity style={styles.videoBtn} onPress={() => handleDemarrerAppel(c)} activeOpacity={0.85}>
                    <Ionicons name="videocam" size={18} color={colors.white} />
                    <Text style={styles.videoBtnText}>Rejoindre la consultation</Text>
                  </TouchableOpacity>
                ) : null}
              </Card>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal prise de RDV */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Prendre un rendez-vous</Text>

              <Text style={styles.modalLabel}>Choisir un psychothérapeute</Text>
              {psyList.length === 0 ? (
                <View style={styles.noDataCard}>
                  <Text style={styles.noDataText}>Aucun psychothérapeute disponible</Text>
                </View>
              ) : (
                psyList.map((psy) => {
                  const active = form.psy_id === psy.id;
                  return (
                    <TouchableOpacity
                      key={psy.id}
                      style={[styles.psyBtn, active && styles.psyBtnActive]}
                      onPress={() => handlePsySelect(psy.id)}
                      activeOpacity={0.85}
                    >
                      <Avatar name={psy.user?.name} size={40} />
                      <View style={styles.psyInfo}>
                        <Text style={[styles.psyName, active && styles.psyNameActive]}>{psy.user?.name}</Text>
                        <Text style={styles.psySub}>Psychothérapeute — GIE FUAM</Text>
                      </View>
                      {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                    </TouchableOpacity>
                  );
                })
              )}

              {form.psy_id ? (
                <>
                  <Text style={styles.modalLabel}>Choisir une date</Text>
                  <View style={styles.calendarContainer}>
                    <Calendar
                      onDayPress={handleDateSelect}
                      minDate={new Date().toISOString().split('T')[0]}
                      markedDates={form.date ? { [form.date]: { selected: true, selectedColor: colors.primary } } : {}}
                      theme={{
                        selectedDayBackgroundColor: colors.primary,
                        todayTextColor: colors.primary,
                        arrowColor: colors.primary,
                        monthTextColor: colors.text,
                      }}
                    />
                  </View>
                </>
              ) : null}

              {form.date && form.psy_id ? (
                <>
                  <Text style={styles.modalLabel}>Choisir un créneau</Text>
                  {creneaux.length === 0 ? (
                    <View style={styles.noDataCard}>
                      <Text style={styles.noDataText}>Aucun créneau disponible ce jour</Text>
                    </View>
                  ) : (
                    <View style={styles.creneauxGrid}>
                      {creneaux.map((c, i) => {
                        const active = form.creneau === c;
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[styles.creneauBtn, active && styles.creneauBtnActive]}
                            onPress={() => setForm({ ...form, creneau: c })}
                            activeOpacity={0.85}
                          >
                            <Text style={[styles.creneauText, active && styles.creneauTextActive]}>{c.heure_debut}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              ) : null}

              {form.creneau ? (
                <View style={styles.resumeCard}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.resumeText}>{form.date} à {form.creneau?.heure_debut}</Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <Button label="Annuler" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
                <Button
                  label="Confirmer le RDV"
                  onPress={handleReserver}
                  loading={saving}
                  disabled={!form.creneau}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  addBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },

  filtresContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filtreBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtreText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  filtreTextActive: { color: colors.white },

  listContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  cardDate: { fontSize: 12, color: colors.primary },
  cardMotif: { fontSize: 12, color: colors.textMuted, flex: 1 },
  videoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.success, borderRadius: radius.md, padding: 12, marginTop: spacing.md,
  },
  videoBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.md, marginTop: spacing.md },
  noDataCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  noDataText: { fontSize: 13, color: colors.textMuted },
  psyBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  psyBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  psyInfo: { flex: 1 },
  psyName: { fontSize: 14, fontWeight: '700', color: colors.text },
  psyNameActive: { color: colors.primaryDark },
  psySub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  calendarContainer: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  creneauxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  creneauBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  creneauBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  creneauText: { fontSize: 14, fontWeight: '600', color: colors.text },
  creneauTextActive: { color: colors.white },
  resumeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 12, marginTop: spacing.md },
  resumeText: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
