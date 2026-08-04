import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Button, EmptyState } from '../../components/ui';

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

  const [form, setForm] = useState({
    titre: '', heure: '09:00', duree: 30, type: null, note: '', rappels: [30],
  });

  useEffect(() => { loadCreneaux(); }, []);

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
        const marqueurs = {};
        (data.data || []).forEach((c) => {
          if (c.date) {
            marqueurs[c.date] = {
              marked: true,
              dotColor: c.type === 'consultation' ? colors.primary : colors.warning,
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
      ? form.rappels.filter((r) => r !== value)
      : [...form.rappels, value];
    setForm({ ...form, rappels });
  };

  const handleSauvegarder = async () => {
    if (!selectedDate) { Alert.alert('Erreur', 'Sélectionnez une date sur le calendrier'); return; }
    if (!form.type) { Alert.alert('Erreur', "Choisissez le type d'événement"); return; }
    if (form.type === 'consultation' && !form.heure) { Alert.alert('Erreur', 'Choisissez une heure'); return; }

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setModalVisible(false);
        loadCreneaux();
        setForm({ titre: '', heure: '09:00', duree: 30, type: null, note: '', rappels: [30] });
        Alert.alert(
          'Événement créé !',
          form.type === 'consultation'
            ? "Créneau de consultation créé. L'admin et les étudiants ont été notifiés."
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

  const evenementsDate = selectedDate ? creneaux.filter((c) => c.date === selectedDate) : [];

  const markedDates = {
    ...evenements,
    ...(selectedDate
      ? { [selectedDate]: { ...evenements[selectedDate], selected: true, selectedColor: colors.primary } }
      : {}),
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mon Calendrier</Text>
          <Text style={styles.headerSub}>{creneaux.length} événement(s)</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (!selectedDate) { Alert.alert('Info', "Sélectionnez d'abord une date sur le calendrier"); return; }
            setModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.calendarContainer} padded={false}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              dotColor: colors.primary,
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />
        </Card>

        <View style={styles.legende}>
          <View style={styles.legendeItem}>
            <View style={[styles.legendeDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendeText}>Consultation</Text>
          </View>
          <View style={styles.legendeItem}>
            <View style={[styles.legendeDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendeText}>Personnel</Text>
          </View>
        </View>

        {selectedDate ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>

            {evenementsDate.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="Aucun événement ce jour"
                actionLabel="Ajouter un événement"
                onAction={() => setModalVisible(true)}
              />
            ) : (
              evenementsDate.map((e) => {
                const isConsult = e.type === 'consultation';
                return (
                  <Card key={e.id} style={[styles.eventCard, { borderLeftColor: isConsult ? colors.primary : colors.warning }]}>
                    <View style={styles.eventHeader}>
                      <View style={styles.eventTitleRow}>
                        <Ionicons name={isConsult ? 'medkit' : 'bookmark'} size={16} color={isConsult ? colors.primary : colors.warning} />
                        <Text style={styles.eventTitre}>{e.titre || 'Événement'}</Text>
                      </View>
                      <View style={[styles.eventTypeBadge, { backgroundColor: isConsult ? colors.primaryLight : colors.warningLight }]}>
                        <Text style={[styles.eventTypeText, { color: isConsult ? colors.primaryDark : colors.warning }]}>
                          {isConsult ? 'Consultation' : 'Personnel'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.eventHeure}>{e.heure_debut} — {e.duree} min</Text>
                    </View>
                    {e.note ? <Text style={styles.eventNote}>{e.note}</Text> : null}
                    {e.rappels?.length > 0 ? (
                      <View style={styles.eventMetaRow}>
                        <Ionicons name="alarm-outline" size={14} color={colors.primary} />
                        <Text style={styles.eventRappels}>
                          {e.rappels.map((r) => (r === 1440 ? '24h' : r >= 60 ? `${r / 60}h` : `${r}min`)).join(', ')} avant
                        </Text>
                      </View>
                    ) : null}
                  </Card>
                );
              })
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <EmptyState icon="hand-left-outline" title="Sélectionnez une date" subtitle="Touchez un jour du calendrier pour voir ou ajouter des événements." />
          </View>
        )}
      </ScrollView>

      {/* Modal ajout événement */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'Nouvel événement'}
              </Text>

              <Text style={styles.modalLabel}>Type d'événement</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, form.type === 'consultation' && styles.typeBtnActive]}
                  onPress={() => setForm({ ...form, type: 'consultation' })}
                  activeOpacity={0.85}
                >
                  <Ionicons name="medkit" size={26} color={form.type === 'consultation' ? colors.primary : colors.textMuted} />
                  <Text style={[styles.typeText, form.type === 'consultation' && { color: colors.primaryDark }]}>Consultation{'\n'}SunuThérapie</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, form.type === 'personnel' && styles.typeBtnPersonnel]}
                  onPress={() => setForm({ ...form, type: 'personnel' })}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bookmark" size={26} color={form.type === 'personnel' ? colors.warning : colors.textMuted} />
                  <Text style={[styles.typeText, form.type === 'personnel' && { color: colors.warning }]}>Événement{'\n'}Personnel</Text>
                </TouchableOpacity>
              </View>

              {form.type === 'consultation' ? (
                <View style={styles.notifInfo}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
                  <Text style={styles.notifInfoText}>L'admin et les étudiants seront notifiés de ce créneau</Text>
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Titre (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={form.titre}
                onChangeText={(v) => setForm({ ...form, titre: v })}
                placeholder={form.type === 'consultation' ? 'Consultation SunuThérapie' : "Titre de l'événement"}
                placeholderTextColor={colors.textFaint}
              />

              <Text style={styles.modalLabel}>Heure de début</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow} contentContainerStyle={{ gap: spacing.sm }}>
                {HEURES.map((h) => (
                  <TouchableOpacity key={h} style={[styles.chipBtn, form.heure === h && styles.chipBtnActive]} onPress={() => setForm({ ...form, heure: h })} activeOpacity={0.8}>
                    <Text style={[styles.chipText, form.heure === h && styles.chipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Durée de la séance</Text>
              <View style={styles.wrapRow}>
                {DUREES.map((d) => (
                  <TouchableOpacity key={d.value} style={[styles.chipBtn, form.duree === d.value && styles.chipBtnActive]} onPress={() => setForm({ ...form, duree: d.value })} activeOpacity={0.8}>
                    <Text style={[styles.chipText, form.duree === d.value && styles.chipTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Rappels</Text>
              <View style={styles.wrapRow}>
                {RAPPELS.map((r) => (
                  <TouchableOpacity key={r.value} style={[styles.chipBtn, form.rappels.includes(r.value) && styles.rappelBtnActive]} onPress={() => toggleRappel(r.value)} activeOpacity={0.8}>
                    <Text style={[styles.chipText, form.rappels.includes(r.value) && styles.rappelTextActive]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Note (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={form.note}
                onChangeText={(v) => setForm({ ...form, note: v })}
                placeholder="Ajoutez une note…"
                placeholderTextColor={colors.textFaint}
                multiline
                numberOfLines={3}
              />

              <View style={styles.resume}>
                <Ionicons name="calendar" size={16} color={colors.primaryDark} />
                <Text style={styles.resumeText}>{selectedDate} à {form.heure} — {form.duree} min</Text>
              </View>

              <View style={styles.modalActions}>
                <Button label="Annuler" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
                <Button label="Enregistrer" onPress={handleSauvegarder} loading={loading} style={{ flex: 1 }} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSub: { fontSize: 13, color: colors.primaryLight, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  addBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  calendarContainer: { margin: spacing.lg, overflow: 'hidden' },
  legende: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.md },
  legendeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendeDot: { width: 10, height: 10, borderRadius: 5 },
  legendeText: { fontSize: 12, color: colors.textMuted },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md, textTransform: 'capitalize' },
  eventCard: { marginBottom: spacing.md, borderLeftWidth: 4 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  eventTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  eventTitre: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  eventTypeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  eventTypeText: { fontSize: 11, fontWeight: '700' },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  eventHeure: { fontSize: 13, color: colors.textMuted },
  eventNote: { fontSize: 13, color: colors.text, marginTop: 6, fontStyle: 'italic' },
  eventRappels: { fontSize: 12, color: colors.primary },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center', textTransform: 'capitalize' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.md },
  typeBtn: { flex: 1, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  typeBtnPersonnel: { borderColor: colors.warning, backgroundColor: colors.warningLight },
  typeText: { fontSize: 13, color: colors.text, textAlign: 'center', fontWeight: '600' },
  notifInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentLight, borderRadius: radius.md, padding: 10, marginTop: spacing.sm },
  notifInfoText: { fontSize: 12, color: colors.accentDark, flex: 1 },
  input: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text },
  noteInput: { height: 80, textAlignVertical: 'top' },
  scrollRow: { maxHeight: 44 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  rappelBtnActive: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  rappelTextActive: { color: colors.warning },
  resume: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 12, marginTop: spacing.lg },
  resumeText: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
