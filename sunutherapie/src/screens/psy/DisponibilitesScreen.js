import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';

const DUREES = [
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
];

const HEURES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  '17:30', '18:00',
];

const RAPPELS = [
  { label: '5 min avant', value: 5 },
  { label: '15 min avant', value: 15 },
  { label: '30 min avant', value: 30 },
  { label: '1h avant', value: 60 },
  { label: '24h avant', value: 1440 },
];

export default function DisponibilitesScreen() {
  const { token, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [evenements, setEvenements] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creneaux, setCreneaux] = useState([]);

  // Formulaire nouvel événement
  const [form, setForm] = useState({
    titre: '',
    heure: '09:00',
    duree: 30,
    type: null, // 'consultation' ou 'personnel'
    note: '',
    rappels: [30],
  });

  useEffect(() => {
    loadCreneaux();
  }, []);

  const loadCreneaux = async () => {
    setLoading(true);
    try {
      const psyId = userProfile?.psychologue?.id;
      const res = await fetch(`${API_URL}/psychotherapeutes/${psyId}/disponibilites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCreneaux(data.data || []);
        // Convertir créneaux en marqueurs calendrier
        const marqueurs = {};
        (data.data || []).forEach(c => {
          if (c.date) {
            marqueurs[c.date] = {
              marked: true,
              dotColor: c.type === 'consultation' ? COLORS.primary : COLORS.warning,
            };
          }
        });
        setEvenements(marqueurs);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRappel = (value) => {
    const rappels = form.rappels.includes(value)
      ? form.rappels.filter(r => r !== value)
      : [...form.rappels, value];
    setForm({ ...form, rappels });
  };

  const handleSauvegarder = async () => {
    if (!selectedDate) {
      Alert.alert('Erreur', 'Sélectionnez une date sur le calendrier');
      return;
    }
    if (!form.type) {
      Alert.alert('Erreur', 'Choisissez le type d\'événement');
      return;
    }
    if (form.type === 'consultation' && !form.heure) {
      Alert.alert('Erreur', 'Choisissez une heure');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date: selectedDate,
        heure_debut: form.heure,
        duree: form.duree,
        type: form.type,
        titre: form.titre || (form.type === 'consultation' ? 'Consultation SunuThérapie' : 'Événement personnel'),
        note: form.note,
        rappels: form.rappels,
        psyName: userProfile?.name,
        notifier_admin: form.type === 'consultation',
      };

      const res = await fetch(`${API_URL}/disponibilites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setModalVisible(false);
        loadCreneaux();
        setForm({ titre: '', heure: '09:00', duree: 30, type: null, note: '', rappels: [30] });
        Alert.alert(
          '✅ Événement créé !',
          form.type === 'consultation'
            ? 'Créneau de consultation créé. L\'admin et les étudiants ont été notifiés.'
            : 'Événement personnel ajouté à votre calendrier.'
        );
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const evenementsDate = selectedDate
    ? creneaux.filter(c => c.date === selectedDate)
    : [];

  const markedDates = {
    ...evenements,
    ...(selectedDate ? {
      [selectedDate]: {
        ...evenements[selectedDate],
        selected: true,
        selectedColor: COLORS.primary,
      }
    } : {}),
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📅 Mon Calendrier</Text>
          <Text style={styles.headerSub}>{creneaux.length} événement(s)</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (!selectedDate) {
              Alert.alert('Info', 'Sélectionnez d\'abord une date sur le calendrier');
              return;
            }
            setModalVisible(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Calendrier */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: COLORS.white,
              calendarBackground: COLORS.white,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text,
              dotColor: COLORS.primary,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
          />
        </View>

        {/* Légende */}
        <View style={styles.legende}>
          <View style={styles.legendeItem}>
            <View style={[styles.legendeDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendeText}>Consultation</Text>
          </View>
          <View style={styles.legendeItem}>
            <View style={[styles.legendeDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendeText}>Personnel</Text>
          </View>
        </View>

        {/* Événements du jour sélectionné */}
        {selectedDate ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📋 {new Date(selectedDate).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>

            {evenementsDate.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>Aucun événement ce jour</Text>
                <TouchableOpacity
                  style={styles.addDayBtn}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addDayBtnText}>+ Ajouter un événement</Text>
                </TouchableOpacity>
              </View>
            ) : (
              evenementsDate.map((e) => (
                <View key={e.id} style={[
                  styles.eventCard,
                  { borderLeftColor: e.type === 'consultation' ? COLORS.primary : COLORS.warning }
                ]}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitre}>
                      {e.type === 'consultation' ? '🩺' : '📌'} {e.titre || 'Événement'}
                    </Text>
                    <View style={[
                      styles.eventTypeBadge,
                      { backgroundColor: e.type === 'consultation' ? COLORS.primaryLight : '#FFF3E0' }
                    ]}>
                      <Text style={[
                        styles.eventTypeText,
                        { color: e.type === 'consultation' ? COLORS.primary : COLORS.warning }
                      ]}>
                        {e.type === 'consultation' ? 'Consultation' : 'Personnel'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventHeure}>
                    🕐 {e.heure_debut} — {e.duree} min
                  </Text>
                  {e.note ? <Text style={styles.eventNote}>📝 {e.note}</Text> : null}
                  {e.rappels?.length > 0 && (
                    <Text style={styles.eventRappels}>
                      ⏰ Rappels : {e.rappels.map(r =>
                        r === 1440 ? '24h' : r >= 60 ? `${r/60}h` : `${r}min`
                      ).join(', ')} avant
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.selectDateHint}>
            <Text style={styles.selectDateText}>👆 Sélectionnez une date pour voir ou ajouter des événements</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal ajout événement */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                ➕ {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long'
                }) : 'Nouvel événement'}
              </Text>

              {/* Type événement */}
              <Text style={styles.modalLabel}>Type d'événement</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, form.type === 'consultation' && styles.typeBtnActive]}
                  onPress={() => setForm({ ...form, type: 'consultation' })}
                >
                  <Text style={styles.typeIcon}>🩺</Text>
                  <Text style={[styles.typeText, form.type === 'consultation' && styles.typeTextActive]}>
                    Consultation{'\n'}SunuThérapie
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, form.type === 'personnel' && styles.typeBtnPersonnel]}
                  onPress={() => setForm({ ...form, type: 'personnel' })}
                >
                  <Text style={styles.typeIcon}>📌</Text>
                  <Text style={[styles.typeText, form.type === 'personnel' && styles.typeTextActive]}>
                    Événement{'\n'}Personnel
                  </Text>
                </TouchableOpacity>
              </View>

              {form.type === 'consultation' && (
                <View style={styles.notifInfo}>
                  <Text style={styles.notifInfoText}>
                    ℹ️ L'admin et les étudiants seront notifiés de ce créneau
                  </Text>
                </View>
              )}

              {/* Titre */}
              <Text style={styles.modalLabel}>Titre (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={form.titre}
                onChangeText={(v) => setForm({ ...form, titre: v })}
                placeholder={form.type === 'consultation' ? 'Consultation SunuThérapie' : 'Titre de l\'événement'}
                placeholderTextColor={COLORS.greyDark}
              />

              {/* Heure */}
              <Text style={styles.modalLabel}>Heure de début</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {HEURES.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.chipBtn, form.heure === h && styles.chipBtnActive]}
                    onPress={() => setForm({ ...form, heure: h })}
                  >
                    <Text style={[styles.chipText, form.heure === h && styles.chipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Durée */}
              <Text style={styles.modalLabel}>Durée de la séance</Text>
              <View style={styles.dureeRow}>
                {DUREES.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.dureeBtn, form.duree === d.value && styles.dureeBtnActive]}
                    onPress={() => setForm({ ...form, duree: d.value })}
                  >
                    <Text style={[styles.dureeText, form.duree === d.value && styles.dureeTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rappels */}
              <Text style={styles.modalLabel}>⏰ Rappels</Text>
              <View style={styles.rappelsRow}>
                {RAPPELS.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.rappelBtn, form.rappels.includes(r.value) && styles.rappelBtnActive]}
                    onPress={() => toggleRappel(r.value)}
                  >
                    <Text style={[styles.rappelText, form.rappels.includes(r.value) && styles.rappelTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note */}
              <Text style={styles.modalLabel}>Note (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={form.note}
                onChangeText={(v) => setForm({ ...form, note: v })}
                placeholder="Ajoutez une note..."
                placeholderTextColor={COLORS.greyDark}
                multiline
                numberOfLines={3}
              />

              {/* Résumé */}
              <View style={styles.resume}>
                <Text style={styles.resumeText}>
                  📅 {selectedDate} à {form.heure} — {form.duree} min
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                  onPress={handleSauvegarder}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.saveText}>Enregistrer</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.secondary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  addBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14 },
  calendarContainer: { margin: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E2E8F0' },
  legende: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 16 },
  legendeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendeDot: { width: 10, height: 10, borderRadius: 5 },
  legendeText: { fontSize: 12, color: COLORS.greyDark },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 12, textTransform: 'capitalize' },
  emptyDay: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyDayText: { fontSize: 14, color: COLORS.greyDark, marginBottom: 12 },
  addDayBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addDayBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  eventCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  eventTitre: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  eventTypeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  eventTypeText: { fontSize: 11, fontWeight: '600' },
  eventHeure: { fontSize: 13, color: COLORS.greyDark, marginBottom: 4 },
  eventNote: { fontSize: 13, color: COLORS.text, marginTop: 4, fontStyle: 'italic' },
  eventRappels: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  selectDateHint: { margin: 16, padding: 20, backgroundColor: COLORS.white, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  selectDateText: { fontSize: 14, color: COLORS.greyDark, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10, marginTop: 14 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: COLORS.white },
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  typeBtnPersonnel: { borderColor: COLORS.warning, backgroundColor: '#FFF3E0' },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeText: { fontSize: 13, color: COLORS.text, textAlign: 'center', fontWeight: '600' },
  typeTextActive: { color: COLORS.primary },
  notifInfo: { backgroundColor: '#E3F2FD', borderRadius: 10, padding: 10, marginTop: 8 },
  notifInfoText: { fontSize: 12, color: COLORS.secondary },
  input: { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text },
  noteInput: { height: 80, textAlignVertical: 'top' },
  scrollRow: { maxHeight: 44 },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  chipBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
  dureeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dureeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  dureeBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  dureeText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  dureeTextActive: { color: COLORS.white },
  rappelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rappelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  rappelBtnActive: { backgroundColor: '#FFF3E0', borderColor: COLORS.warning },
  rappelText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  rappelTextActive: { color: COLORS.warning },
  resume: { backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, marginTop: 16, alignItems: 'center' },
  resumeText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  cancelText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveBtnDisabled: { backgroundColor: COLORS.greyDark },
  saveText: { fontSize: 15, color: COLORS.white, fontWeight: 'bold' },
});
