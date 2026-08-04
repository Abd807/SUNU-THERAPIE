import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Avatar, Button, EmptyState } from '../../components/ui';

const TYPES_NOTES = [
  { key: 'consultation', label: 'Consultation', color: colors.primary, bg: colors.primaryLight },
  { key: 'privee', label: 'Privée', color: colors.textMuted, bg: colors.surfaceAlt },
  { key: 'partagee', label: 'Partagée', color: colors.success, bg: colors.successLight },
  { key: 'urgence', label: 'Urgence', color: colors.danger, bg: colors.dangerLight },
];

const getTypeInfo = (type) => TYPES_NOTES.find((t) => t.key === type) || TYPES_NOTES[1];

export default function NotesScreen({ hideHeader = false }) {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filtreType, setFiltreType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const [form, setForm] = useState({ titre: '', contenu: '', type: 'privee', etudiant_id: null });

  useEffect(() => { loadNotes(); loadPatients(); }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notes`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setNotes(data.data || []);
    } catch (error) { console.error('Erreur:', error); } finally { setLoading(false); }
  };

  const loadPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/historique/psychotherapeute`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const etudiants = []; const ids = new Set();
        (data.data || []).forEach((c) => { if (c.etudiant && !ids.has(c.etudiant.id)) { ids.add(c.etudiant.id); etudiants.push(c.etudiant); } });
        setPatients(etudiants);
      }
    } catch (error) { console.error('Erreur patients:', error); }
  };

  const resetForm = () => { setForm({ titre: '', contenu: '', type: 'privee', etudiant_id: null }); setEditNote(null); };

  const handleOuvrir = (note = null) => {
    if (note) {
      setEditNote(note);
      setForm({ titre: note.titre, contenu: note.contenu, type: note.type, etudiant_id: note.etudiant_id });
    }
    setModalVisible(true);
  };

  const handleSauvegarder = async () => {
    if (!form.titre.trim()) { Alert.alert('Erreur', 'Le titre est requis'); return; }
    if (!form.contenu.trim()) { Alert.alert('Erreur', 'Le contenu est requis'); return; }
    setSaving(true);
    try {
      const url = editNote ? `${API_URL}/notes/${editNote.id}` : `${API_URL}/notes`;
      const method = editNote ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setModalVisible(false); resetForm(); loadNotes();
        Alert.alert('Succès', editNote ? 'Note modifiée !' : 'Note créée !');
      } else {
        Alert.alert('Erreur', data.message || 'Erreur');
      }
    } catch (error) { Alert.alert('Erreur', 'Erreur réseau'); } finally { setSaving(false); }
  };

  const handleSupprimer = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        loadNotes();
      } },
    ]);
  };

  const notesFiltrees = notes
    .filter((n) => filtreType === 'all' || n.type === filtreType)
    .filter((n) => !searchText || n.titre.toLowerCase().includes(searchText.toLowerCase()) || n.contenu.toLowerCase().includes(searchText.toLowerCase()));

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const Wrapper = hideHeader ? View : SafeAreaView;
  const wrapperProps = hideHeader ? {} : { edges: ['top', 'left', 'right'] };

  return (
    <Wrapper {...wrapperProps} style={styles.container}>
      {!hideHeader ? (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mes Notes</Text>
            <Text style={styles.headerSub}>{notes.length} note(s)</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.addBtnRow}>
          <Text style={styles.countText}>{notes.length} note(s)</Text>
          <TouchableOpacity style={styles.addBtnSmall} onPress={() => { resetForm(); setModalVisible(true); }} activeOpacity={0.85}>
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.addBtnSmallText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Rechercher une note…"
          placeholderTextColor={colors.textFaint}
        />
      </View>

      {/* Filtres */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtresContainer}>
          <TouchableOpacity style={[styles.filtreBtn, filtreType === 'all' && styles.filtreBtnActive]} onPress={() => setFiltreType('all')} activeOpacity={0.8}>
            <Text style={[styles.filtreText, filtreType === 'all' && styles.filtreTextActive]}>Tout</Text>
          </TouchableOpacity>
          {TYPES_NOTES.map((t) => {
            const active = filtreType === t.key;
            return (
              <TouchableOpacity key={t.key} style={[styles.filtreBtn, active && { backgroundColor: t.color, borderColor: t.color }]} onPress={() => setFiltreType(t.key)} activeOpacity={0.8}>
                <Text style={[styles.filtreText, active && styles.filtreTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Liste */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {notesFiltrees.length === 0 ? (
          <EmptyState icon="document-text-outline" title="Aucune note" subtitle="Créez votre première note." actionLabel="Ajouter une note" onAction={() => { resetForm(); setModalVisible(true); }} style={{ marginTop: spacing.lg }} />
        ) : (
          notesFiltrees.map((note) => {
            const typeInfo = getTypeInfo(note.type);
            return (
              <Card key={note.id} style={[styles.noteCard, { borderLeftColor: typeInfo.color }]} onPress={() => handleOuvrir(note)}>
                <View style={styles.noteHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
                  </View>
                  <Text style={styles.noteDate}>
                    {new Date(note.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.noteTitre}>{note.titre}</Text>
                {note.etudiant ? (
                  <View style={styles.noteEtudiantRow}>
                    <Ionicons name="person-outline" size={13} color={colors.accent} />
                    <Text style={styles.noteEtudiant}>{note.etudiant?.user?.name || 'Patient'}</Text>
                  </View>
                ) : null}
                <Text style={styles.noteContenu} numberOfLines={2}>{note.contenu}</Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleOuvrir(note)} activeOpacity={0.85}>
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={styles.editBtnText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleSupprimer(note.id)} activeOpacity={0.85}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{editNote ? 'Modifier la note' : 'Nouvelle note'}</Text>

              <Text style={styles.modalLabel}>Type de note</Text>
              <View style={styles.wrapRow}>
                {TYPES_NOTES.map((t) => {
                  const active = form.type === t.key;
                  return (
                    <TouchableOpacity key={t.key} style={[styles.typeBtn, active && { backgroundColor: t.bg, borderColor: t.color }]} onPress={() => setForm({ ...form, type: t.key })} activeOpacity={0.85}>
                      <Text style={[styles.typeBtnText, active && { color: t.color }]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {form.type === 'urgence' ? (
                <View style={styles.urgenceWarning}>
                  <Ionicons name="warning-outline" size={16} color={colors.danger} />
                  <Text style={styles.urgenceText}>L'admin sera notifié de cette note d'urgence</Text>
                </View>
              ) : null}
              {form.type === 'partagee' ? (
                <View style={styles.partageInfo}>
                  <Ionicons name="share-social-outline" size={16} color={colors.success} />
                  <Text style={styles.partageText}>Cette note sera visible par le patient sélectionné</Text>
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput style={styles.input} value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} placeholder="Titre de la note" placeholderTextColor={colors.textFaint} />

              <Text style={styles.modalLabel}>Contenu *</Text>
              <TextInput style={[styles.input, styles.contenuInput]} value={form.contenu} onChangeText={(v) => setForm({ ...form, contenu: v })} placeholder="Écrivez votre note ici…" placeholderTextColor={colors.textFaint} multiline numberOfLines={6} />

              {(form.type === 'partagee' || form.type === 'consultation' || form.type === 'urgence') ? (
                <>
                  <Text style={styles.modalLabel}>Patient concerné</Text>
                  {patients.length === 0 ? (
                    <View style={styles.noPatientCard}><Text style={styles.noPatientText}>Aucun patient trouvé</Text></View>
                  ) : (
                    <View style={styles.patientsList}>
                      {patients.map((p) => {
                        const active = form.etudiant_id === p.id;
                        return (
                          <TouchableOpacity key={p.id} style={[styles.patientBtn, active && styles.patientBtnActive]} onPress={() => setForm({ ...form, etudiant_id: active ? null : p.id })} activeOpacity={0.85}>
                            <Avatar name={p.user?.name} size={36} />
                            <Text style={[styles.patientName, active && { color: colors.primaryDark }]}>{p.user?.name || 'Patient'}</Text>
                            {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              ) : null}

              <View style={styles.modalActions}>
                <Button label="Annuler" variant="outline" onPress={() => { setModalVisible(false); resetForm(); }} style={{ flex: 1 }} />
                <Button label={editNote ? 'Modifier' : 'Enregistrer'} onPress={handleSauvegarder} loading={saving} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSub: { fontSize: 13, color: colors.primaryLight, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  addBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  addBtnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  countText: { fontSize: 13, color: colors.textMuted },
  addBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  addBtnSmallText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: colors.text },
  filtresContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filtreBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtreText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  filtreTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  noteCard: { marginBottom: spacing.md, borderLeftWidth: 4 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  noteDate: { fontSize: 11, color: colors.textFaint },
  noteTitre: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  noteEtudiantRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  noteEtudiant: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  noteContenu: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  noteActions: { flexDirection: 'row', gap: spacing.sm },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primaryLight, padding: 9, borderRadius: radius.md },
  editBtnText: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  deleteBtn: { backgroundColor: colors.dangerLight, paddingHorizontal: 16, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border },
  typeBtnText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  urgenceWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dangerLight, borderRadius: radius.md, padding: 10, marginTop: spacing.sm },
  urgenceText: { fontSize: 12, color: colors.danger, fontWeight: '600', flex: 1 },
  partageInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.successLight, borderRadius: radius.md, padding: 10, marginTop: spacing.sm },
  partageText: { fontSize: 12, color: colors.success, fontWeight: '600', flex: 1 },
  input: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text },
  contenuInput: { height: 140, textAlignVertical: 'top' },
  noPatientCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  noPatientText: { fontSize: 13, color: colors.textMuted },
  patientsList: { maxHeight: 240 },
  patientBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  patientBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  patientName: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
