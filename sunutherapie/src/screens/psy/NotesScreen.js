import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';

const TYPES_NOTES = [
  { key: 'consultation', label: '📋 Consultation', color: COLORS.primary, bg: COLORS.primaryLight },
  { key: 'privee', label: '🔒 Privée', color: COLORS.greyDark, bg: COLORS.grey },
  { key: 'partagee', label: '📤 Partagée', color: COLORS.success, bg: '#E8F5E9' },
  { key: 'urgence', label: '🚨 Urgence', color: COLORS.danger, bg: '#FFEBEE' },
];

export default function NotesScreen() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filtreType, setFiltreType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const [form, setForm] = useState({
    titre: '',
    contenu: '',
    type: 'privee',
    etudiant_id: null,
  });

  useEffect(() => {
    loadNotes();
    loadPatients();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setNotes(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/historique/psychotherapeute`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const etudiants = [];
        const ids = new Set();
        (data.data || []).forEach(c => {
          if (c.etudiant && !ids.has(c.etudiant.id)) {
            ids.add(c.etudiant.id);
            etudiants.push(c.etudiant);
          }
        });
        setPatients(etudiants);
      }
    } catch (error) {
      console.error('Erreur patients:', error);
    }
  };

  const resetForm = () => {
    setForm({ titre: '', contenu: '', type: 'privee', etudiant_id: null });
    setEditNote(null);
  };

  const handleOuvrir = (note = null) => {
    if (note) {
      setEditNote(note);
      setForm({
        titre: note.titre,
        contenu: note.contenu,
        type: note.type,
        etudiant_id: note.etudiant_id,
      });
    }
    setModalVisible(true);
  };

  const handleSauvegarder = async () => {
    if (!form.titre.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }
    if (!form.contenu.trim()) {
      Alert.alert('Erreur', 'Le contenu est requis');
      return;
    }

    setSaving(true);
    try {
      const url = editNote ? `${API_URL}/notes/${editNote.id}` : `${API_URL}/notes`;
      const method = editNote ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setModalVisible(false);
        resetForm();
        loadNotes();
        Alert.alert('✅', editNote ? 'Note modifiée !' : 'Note créée !');
      } else {
        Alert.alert('Erreur', data.message || 'Erreur');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          loadNotes();
        }
      },
    ]);
  };

  const getTypeInfo = (type) => TYPES_NOTES.find(t => t.key === type) || TYPES_NOTES[1];

  const notesFiltrees = notes
    .filter(n => filtreType === 'all' || n.type === filtreType)
    .filter(n => !searchText || n.titre.toLowerCase().includes(searchText.toLowerCase()) || n.contenu.toLowerCase().includes(searchText.toLowerCase()));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📝 Mes Notes</Text>
          <Text style={styles.headerSub}>{notes.length} note(s)</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="🔍 Rechercher une note..."
          placeholderTextColor={COLORS.greyDark}
        />
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresContainer}>
        <TouchableOpacity
          style={[styles.filtreBtn, filtreType === 'all' && styles.filtreBtnActive]}
          onPress={() => setFiltreType('all')}
        >
          <Text style={[styles.filtreText, filtreType === 'all' && styles.filtreTextActive]}>📋 Tout</Text>
        </TouchableOpacity>
        {TYPES_NOTES.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.filtreBtn, filtreType === t.key && { backgroundColor: t.color, borderColor: t.color }]}
            onPress={() => setFiltreType(t.key)}
          >
            <Text style={[styles.filtreText, filtreType === t.key && styles.filtreTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {notesFiltrees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune note</Text>
            <Text style={styles.emptyText}>Créez votre première note</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
              <Text style={styles.emptyBtnText}>+ Ajouter une note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          notesFiltrees.map((note) => {
            const typeInfo = getTypeInfo(note.type);
            return (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteCard, { borderLeftColor: typeInfo.color }]}
                onPress={() => handleOuvrir(note)}
                activeOpacity={0.8}
              >
                <View style={styles.noteHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
                  </View>
                  <Text style={styles.noteDate}>
                    {new Date(note.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>

                <Text style={styles.noteTitre}>{note.titre}</Text>

                {note.etudiant && (
                  <Text style={styles.noteEtudiant}>
                    👤 {note.etudiant?.user?.name || 'Patient'}
                  </Text>
                )}

                <Text style={styles.noteContenu} numberOfLines={2}>{note.contenu}</Text>

                <View style={styles.noteActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleOuvrir(note)}>
                    <Text style={styles.editBtnText}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleSupprimer(note.id)}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editNote ? '✏️ Modifier la note' : '➕ Nouvelle note'}</Text>

              {/* Type */}
              <Text style={styles.modalLabel}>Type de note</Text>
              <View style={styles.typeGrid}>
                {TYPES_NOTES.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeBtn, form.type === t.key && { backgroundColor: t.bg, borderColor: t.color }]}
                    onPress={() => setForm({ ...form, type: t.key })}
                  >
                    <Text style={[styles.typeBtnText, form.type === t.key && { color: t.color }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {form.type === 'urgence' && (
                <View style={styles.urgenceWarning}>
                  <Text style={styles.urgenceText}>⚠️ L'admin sera notifié de cette note d'urgence</Text>
                </View>
              )}

              {form.type === 'partagee' && (
                <View style={styles.partageInfo}>
                  <Text style={styles.partageText}>📤 Cette note sera visible par le patient sélectionné</Text>
                </View>
              )}

              {/* Titre */}
              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={form.titre}
                onChangeText={(v) => setForm({ ...form, titre: v })}
                placeholder="Titre de la note"
                placeholderTextColor={COLORS.greyDark}
              />

              {/* Contenu */}
              <Text style={styles.modalLabel}>Contenu *</Text>
              <TextInput
                style={[styles.input, styles.contenuInput]}
                value={form.contenu}
                onChangeText={(v) => setForm({ ...form, contenu: v })}
                placeholder="Écrivez votre note ici..."
                placeholderTextColor={COLORS.greyDark}
                multiline
                numberOfLines={6}
              />

              {/* Patient (si partagée ou consultation) */}
              {(form.type === 'partagee' || form.type === 'consultation' || form.type === 'urgence') && (
                <>
                  <Text style={styles.modalLabel}>Patient concerné</Text>
                  {patients.length === 0 ? (
                    <View style={styles.noPatientCard}>
                      <Text style={styles.noPatientText}>Aucun patient trouvé</Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.patientsList}>
                      {patients.map(p => (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.patientBtn, form.etudiant_id === p.id && styles.patientBtnActive]}
                          onPress={() => setForm({ ...form, etudiant_id: form.etudiant_id === p.id ? null : p.id })}
                        >
                          <View style={styles.patientAvatar}>
                            <Text style={styles.patientAvatarText}>
                              {p.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                            </Text>
                          </View>
                          <Text style={[styles.patientName, form.etudiant_id === p.id && styles.patientNameActive]}>
                            {p.user?.name || 'Patient'}
                          </Text>
                          {form.etudiant_id === p.id && <Text>✅</Text>}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSauvegarder}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.saveText}>{editNote ? 'Modifier' : 'Enregistrer'}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.secondary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  addBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: '#E2E8F0' },
  filtresContainer: { paddingHorizontal: 16, paddingVertical: 10, maxHeight: 56 },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  filtreBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  filtreText: { fontSize: 12, color: COLORS.greyDark, fontWeight: '600' },
  filtreTextActive: { color: COLORS.white },
  listContainer: { paddingHorizontal: 16, paddingTop: 8 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: COLORS.greyDark, textAlign: 'center', marginBottom: 16 },
  emptyBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyBtnText: { color: COLORS.white, fontWeight: 'bold' },
  noteCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  noteDate: { fontSize: 11, color: COLORS.greyDark },
  noteTitre: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  noteEtudiant: { fontSize: 12, color: COLORS.secondary, marginBottom: 6 },
  noteContenu: { fontSize: 13, color: COLORS.greyDark, lineHeight: 20, marginBottom: 12 },
  noteActions: { flexDirection: 'row', gap: 10 },
  editBtn: { flex: 1, backgroundColor: COLORS.secondaryLight, padding: 8, borderRadius: 8, alignItems: 'center' },
  editBtnText: { fontSize: 13, color: COLORS.secondary, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FFEBEE', padding: 8, borderRadius: 8, paddingHorizontal: 14 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10, marginTop: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#E2E8F0' },
  typeBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  urgenceWarning: { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 10, marginTop: 8 },
  urgenceText: { fontSize: 12, color: COLORS.danger, fontWeight: '600' },
  partageInfo: { backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, marginTop: 8 },
  partageText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  input: { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text },
  contenuInput: { height: 140, textAlignVertical: 'top' },
  noPatientCard: { backgroundColor: COLORS.background, borderRadius: 10, padding: 14, alignItems: 'center' },
  noPatientText: { fontSize: 13, color: COLORS.greyDark },
  patientsList: { maxHeight: 200 },
  patientBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: COLORS.background, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  patientBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  patientAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  patientAvatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  patientName: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  patientNameActive: { color: COLORS.primary },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  cancelText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.secondary },
  saveBtnDisabled: { backgroundColor: COLORS.greyDark },
  saveText: { fontSize: 15, color: COLORS.white, fontWeight: 'bold' },
});
