import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';
import {
  apiGetConsultationsEtudiant,
  apiGetPsychotherapeutesDisponibles,
  apiCreerConsultation,
  apiGetVideoToken,
} from '../../services/api';

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

  const [form, setForm] = useState({
    psy_id: null,
    date: '',
    creneau: null,
    motif: '',
  });

  const filtres = [
    { key: 'all', label: '📋 Tout' },
    { key: 'en_attente', label: '⏳ En attente' },
    { key: 'acceptee', label: '✅ Acceptées' },
    { key: 'terminee', label: '✔️ Terminées' },
  ];

  useEffect(() => {
    loadData();
    if (route?.params?.psyId) {
      setForm(f => ({ ...f, psy_id: route.params.psyId }));
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
        Alert.alert('✅ Demande envoyée !', 'Votre demande de consultation a été envoyée au psychothérapeute.');
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente': return COLORS.warning;
      case 'acceptee': return COLORS.success;
      case 'terminee': return COLORS.greyDark;
      case 'refusee': return COLORS.danger;
      default: return COLORS.greyDark;
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'en_attente': return '⏳ En attente';
      case 'acceptee': return '✅ Acceptée';
      case 'terminee': return '✔️ Terminée';
      case 'refusee': return '❌ Refusée';
      default: return statut;
    }
  };

  const consultationsFiltrees = filtre === 'all'
    ? consultations
    : consultations.filter(c => c.statut === filtre);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Mes Consultations</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ RDV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresContainer}>
        {filtres.map(f => (
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        contentContainerStyle={styles.listContainer}
      >
        {consultationsFiltrees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune consultation</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>+ Prendre un RDV</Text>
            </TouchableOpacity>
          </View>
        ) : (
          consultationsFiltrees.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {c.psychologue?.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{c.psychologue?.user?.name}</Text>
                  <Text style={styles.cardDate}>
                    📅 {c.date_consultation
                      ? new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Date à confirmer'}
                  </Text>
                  {c.motif && <Text style={styles.cardMotif}>💬 {c.motif}</Text>}
                </View>
                <View style={[styles.statutBadge, { backgroundColor: getStatutColor(c.statut) + '20' }]}>
                  <Text style={[styles.statutText, { color: getStatutColor(c.statut) }]}>
                    {getStatutLabel(c.statut)}
                  </Text>
                </View>
              </View>

              {/* Bouton appel vidéo si acceptée */}
              {c.statut === 'acceptee' && (
                <TouchableOpacity
                  style={styles.videoBtn}
                  onPress={() => handleDemarrerAppel(c)}
                >
                  <Text style={styles.videoBtnText}>📹 Rejoindre la consultation</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal prise de RDV */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>📅 Prendre un RDV</Text>

              <Text style={styles.modalLabel}>Choisir un psychothérapeute</Text>
              {psyList.length === 0 ? (
                <View style={styles.noPsyCard}>
                  <Text style={styles.noPsyText}>Aucun psychothérapeute disponible</Text>
                </View>
              ) : (
                psyList.map(psy => (
                  <TouchableOpacity
                    key={psy.id}
                    style={[styles.psyBtn, form.psy_id === psy.id && styles.psyBtnActive]}
                    onPress={() => handlePsySelect(psy.id)}
                  >
                    <View style={styles.psyAvatar}>
                      <Text style={styles.psyAvatarText}>
                        {psy.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                      </Text>
                    </View>
                    <View style={styles.psyInfo}>
                      <Text style={[styles.psyName, form.psy_id === psy.id && styles.psyNameActive]}>
                        {psy.user?.name}
                      </Text>
                      <Text style={styles.psySub}>Psychothérapeute — GIE FUAM</Text>
                    </View>
                    {form.psy_id === psy.id && <Text>✅</Text>}
                  </TouchableOpacity>
                ))
              )}

              {form.psy_id && (
                <>
                  <Text style={styles.modalLabel}>Choisir une date</Text>
                  <View style={styles.calendarContainer}>
                    <Calendar
                      onDayPress={handleDateSelect}
                      minDate={new Date().toISOString().split('T')[0]}
                      markedDates={form.date ? { [form.date]: { selected: true, selectedColor: COLORS.primary } } : {}}
                      theme={{
                        selectedDayBackgroundColor: COLORS.primary,
                        todayTextColor: COLORS.primary,
                        arrowColor: COLORS.primary,
                        monthTextColor: COLORS.text,
                      }}
                    />
                  </View>
                </>
              )}

              {form.date && form.psy_id && (
                <>
                  <Text style={styles.modalLabel}>Choisir un créneau</Text>
                  {creneaux.length === 0 ? (
                    <View style={styles.noCreneauCard}>
                      <Text style={styles.noCreneauText}>Aucun créneau disponible ce jour</Text>
                    </View>
                  ) : (
                    <View style={styles.creneauxGrid}>
                      {creneaux.map((c, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[styles.creneauBtn, form.creneau === c && styles.creneauBtnActive]}
                          onPress={() => setForm({ ...form, creneau: c })}
                        >
                          <Text style={[styles.creneauText, form.creneau === c && styles.creneauTextActive]}>
                            {c.heure_debut}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              {form.creneau && (
                <>
                  <View style={styles.resumeCard}>
                    <Text style={styles.resumeText}>
                      📅 {form.date} à {form.creneau?.heure_debut}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, (!form.creneau || saving) && styles.saveBtnDisabled]}
                  onPress={handleReserver}
                  disabled={!form.creneau || saving}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.saveText}>Confirmer le RDV</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.primary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  addBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  filtresContainer: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  filtreBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filtreText: { fontSize: 12, color: COLORS.greyDark, fontWeight: '600' },
  filtreTextActive: { color: COLORS.white },
  listContainer: { paddingHorizontal: 16, paddingTop: 8 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyBtnText: { color: COLORS.white, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  cardDate: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  cardMotif: { fontSize: 12, color: COLORS.greyDark, marginTop: 2 },
  statutBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statutText: { fontSize: 11, fontWeight: '600' },
  videoBtn: { backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: COLORS.success },
  videoBtnText: { fontSize: 14, fontWeight: 'bold', color: COLORS.success },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10, marginTop: 14 },
  noPsyCard: { backgroundColor: COLORS.background, borderRadius: 10, padding: 14, alignItems: 'center' },
  noPsyText: { fontSize: 13, color: COLORS.greyDark },
  psyBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: COLORS.background, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  psyBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  psyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  psyAvatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  psyInfo: { flex: 1 },
  psyName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  psyNameActive: { color: COLORS.primary },
  psySub: { fontSize: 11, color: COLORS.greyDark },
  calendarContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  noCreneauCard: { backgroundColor: COLORS.background, borderRadius: 10, padding: 14, alignItems: 'center' },
  noCreneauText: { fontSize: 13, color: COLORS.greyDark },
  creneauxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  creneauBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  creneauBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  creneauText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  creneauTextActive: { color: COLORS.white },
  resumeCard: { backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, marginTop: 12, alignItems: 'center' },
  resumeText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  cancelText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveBtnDisabled: { backgroundColor: COLORS.greyDark },
  saveText: { fontSize: 15, color: COLORS.white, fontWeight: 'bold' },
});
