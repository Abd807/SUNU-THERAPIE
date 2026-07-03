import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';

const TYPES = [
  { key: 'video', label: 'Vidéo / YouTube', icon: '🎥' },
  { key: 'pdf', label: 'PDF', icon: '📄' },
  { key: 'note', label: 'Note', icon: '📝' },
];

const CATEGORIES = [
  { key: 'anxiete', label: '😰 Anxiété' },
  { key: 'depression', label: '😔 Dépression' },
  { key: 'stress', label: '😤 Stress' },
  { key: 'sommeil', label: '😴 Sommeil' },
  { key: 'confiance', label: '💪 Confiance' },
  { key: 'deuil', label: '🕊️ Deuil' },
  { key: 'autre', label: '📌 Autre' },
];

export default function RessourcesScreen({ hideHeader = false }) {
  const { token } = useAuth();
  const [ressources, setRessources] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtreType, setFiltreType] = useState('all');

  const [form, setForm] = useState({
    titre: '', type: 'video', lien: '', description: '',
    note_texte: '', categorie: 'autre', visibilite: 'public', patient_id: null,
  });

  useEffect(() => { loadRessources(); loadPatients(); }, []);

  const loadRessources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ressources/mes-ressources`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setRessources(data.data || []);
    } catch (error) { console.error('Erreur:', error); } finally { setLoading(false); }
  };

  const loadPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/historique/psychotherapeute`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const etudiants = []; const ids = new Set();
        (data.data || []).forEach(c => { if (c.etudiant && !ids.has(c.etudiant.id)) { ids.add(c.etudiant.id); etudiants.push(c.etudiant); } });
        setPatients(etudiants);
      }
    } catch (error) { console.error('Erreur patients:', error); }
  };

  const resetForm = () => setForm({ titre: '', type: 'video', lien: '', description: '', note_texte: '', categorie: 'autre', visibilite: 'public', patient_id: null });

  const handleSauvegarder = async () => {
    if (!form.titre.trim()) { Alert.alert('Erreur', 'Le titre est requis'); return; }
    if (form.type !== 'note' && !form.lien.trim()) { Alert.alert('Erreur', 'Le lien est requis'); return; }
    if (form.type === 'note' && !form.note_texte.trim()) { Alert.alert('Erreur', 'Le texte est requis'); return; }
    if (form.visibilite === 'prive' && !form.patient_id) { Alert.alert('Erreur', 'Sélectionnez un patient'); return; }
    setSaving(true);
    try {
      const payload = {
        titre: form.titre,
        type: form.type === 'note' ? 'note' : form.type === 'pdf' ? 'pdf' : 'lien_youtube',
        categorie: form.categorie,
        url: form.type !== 'note' ? form.lien : null,
        description: form.type !== 'note' ? form.description : form.note_texte,
        public: form.visibilite === 'public',
        destinataires: form.visibilite === 'public' ? 'tous_mes_patients' : 'un_patient',
        etudiant_ids: form.visibilite === 'prive' && form.patient_id ? [form.patient_id] : [],
      };
      const res = await fetch(`${API_URL}/ressources`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { setModalVisible(false); resetForm(); loadRessources(); Alert.alert('✅', 'Ressource ajoutée !'); }
      else Alert.alert('Erreur', data.message || 'Erreur');
    } catch (error) { Alert.alert('Erreur', 'Erreur réseau'); } finally { setSaving(false); }
  };

  const handleSupprimer = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette ressource ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await fetch(`${API_URL}/ressources/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); loadRessources(); } },
    ]);
  };

  const getTypeIcon = (type) => type === 'note' ? '📝' : type === 'pdf' ? '📄' : '🎥';

  const ressourcesFiltrees = filtreType === 'all' ? ressources : ressources.filter(r => {
    if (filtreType === 'video') return r.type === 'lien_youtube' || r.type === 'lien_web';
    if (filtreType === 'pdf') return r.type === 'pdf';
    if (filtreType === 'note') return r.type === 'note';
    return true;
  });

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.secondary} /></View>;

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>📚 Mes Ressources</Text>
            <Text style={styles.headerSub}>{ressources.length} ressource(s)</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}

      {hideHeader && (
        <View style={styles.addBtnRow}>
          <Text style={styles.countText}>{ressources.length} ressource(s)</Text>
          <TouchableOpacity style={styles.addBtnSmall} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresContainer}>
        {[{ key: 'all', label: '📋 Tout' }, ...TYPES].map(f => (
          <TouchableOpacity key={f.key} style={[styles.filtreBtn, filtreType === f.key && styles.filtreBtnActive]} onPress={() => setFiltreType(f.key)}>
            <Text style={[styles.filtreText, filtreType === f.key && styles.filtreTextActive]}>{f.icon ? `${f.icon} ${f.label}` : f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {ressourcesFiltrees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune ressource</Text>
            <Text style={styles.emptyText}>Ajoutez des ressources pour vos patients</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          ressourcesFiltrees.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeIconContainer}><Text style={styles.typeIcon}>{getTypeIcon(r.type)}</Text></View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitre}>{r.titre}</Text>
                  <Text style={styles.cardCategorie}>{CATEGORIES.find(c => c.key === r.categorie)?.label || r.categorie}</Text>
                  {r.description ? <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text> : null}
                </View>
                <Text style={[styles.visibiliteText, { color: r.public ? COLORS.success : COLORS.warning }]}>{r.public ? '🌍' : '🔒'}</Text>
              </View>
              <View style={styles.cardActions}>
                {r.url && <TouchableOpacity style={styles.openBtn} onPress={() => Linking.openURL(r.url)}><Text style={styles.openBtnText}>🔗 Ouvrir</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleSupprimer(r.id)}><Text style={styles.deleteBtnText}>🗑️</Text></TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>➕ Nouvelle ressource</Text>
              <Text style={styles.modalLabel}>Type</Text>
              <View style={styles.typeRow}>
                {TYPES.map(t => (
                  <TouchableOpacity key={t.key} style={[styles.typeBtn, form.type === t.key && styles.typeBtnActive]} onPress={() => setForm({ ...form, type: t.key })}>
                    <Text style={styles.typeBtnIcon}>{t.icon}</Text>
                    <Text style={[styles.typeBtnText, form.type === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput style={styles.input} value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} placeholder="Titre de la ressource" placeholderTextColor={COLORS.greyDark} />
              {form.type !== 'note' && (
                <>
                  <Text style={styles.modalLabel}>{form.type === 'video' ? '🔗 Lien YouTube / Vidéo *' : '🔗 Lien PDF *'}</Text>
                  <TextInput style={styles.input} value={form.lien} onChangeText={(v) => setForm({ ...form, lien: v })} placeholder="https://..." placeholderTextColor={COLORS.greyDark} autoCapitalize="none" keyboardType="url" />
                  <Text style={styles.modalLabel}>Description (optionnel)</Text>
                  <TextInput style={[styles.input, styles.textAreaInput]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Décrivez cette ressource..." placeholderTextColor={COLORS.greyDark} multiline numberOfLines={3} />
                </>
              )}
              {form.type === 'note' && (
                <>
                  <Text style={styles.modalLabel}>📝 Texte *</Text>
                  <TextInput style={[styles.input, styles.noteInput]} value={form.note_texte} onChangeText={(v) => setForm({ ...form, note_texte: v })} placeholder="Écrivez votre note ici..." placeholderTextColor={COLORS.greyDark} multiline numberOfLines={6} />
                </>
              )}
              <Text style={styles.modalLabel}>Catégorie</Text>
              <View style={styles.categorieGrid}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c.key} style={[styles.categorieBtn, form.categorie === c.key && styles.categorieBtnActive]} onPress={() => setForm({ ...form, categorie: c.key })}>
                    <Text style={[styles.categorieBtnText, form.categorie === c.key && styles.categorieBtnTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalLabel}>Partager avec</Text>
              <View style={styles.visibiliteRow}>
                <TouchableOpacity style={[styles.visibiliteBtn, form.visibilite === 'public' && styles.visibiliteBtnActive]} onPress={() => setForm({ ...form, visibilite: 'public', patient_id: null })}>
                  <Text style={styles.visibiliteBtnIcon}>🌍</Text>
                  <Text style={[styles.visibiliteBtnText, form.visibilite === 'public' && styles.visibiliteBtnTextActive]}>Tous mes patients</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.visibiliteBtn, form.visibilite === 'prive' && styles.visibiliteBtnPriveActive]} onPress={() => setForm({ ...form, visibilite: 'prive' })}>
                  <Text style={styles.visibiliteBtnIcon}>🔒</Text>
                  <Text style={[styles.visibiliteBtnText, form.visibilite === 'prive' && styles.visibiliteBtnTextActive]}>Un patient</Text>
                </TouchableOpacity>
              </View>
              {form.visibilite === 'prive' && (
                <>
                  <Text style={styles.modalLabel}>Choisir le patient</Text>
                  {patients.length === 0 ? (
                    <View style={styles.noPatientCard}><Text style={styles.noPatientText}>Aucun patient trouvé</Text></View>
                  ) : (
                    patients.map(p => (
                      <TouchableOpacity key={p.id} style={[styles.patientBtn, form.patient_id === p.id && styles.patientBtnActive]} onPress={() => setForm({ ...form, patient_id: p.id })}>
                        <View style={styles.patientAvatar}><Text style={styles.patientAvatarText}>{p.user?.name?.charAt(0)?.toUpperCase() || '👤'}</Text></View>
                        <Text style={[styles.patientName, form.patient_id === p.id && styles.patientNameActive]}>{p.user?.name || 'Patient'}</Text>
                        {form.patient_id === p.id && <Text style={styles.patientCheck}>✅</Text>}
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSauvegarder} disabled={saving}>
                  {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveText}>Enregistrer</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.secondary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  addBtnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  countText: { fontSize: 13, color: COLORS.greyDark },
  addBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnSmall: { backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14 },
  filtresContainer: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
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
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  typeIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  typeIcon: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardTitre: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  cardCategorie: { fontSize: 12, color: COLORS.secondary, marginTop: 2 },
  cardDesc: { fontSize: 12, color: COLORS.greyDark, marginTop: 4, lineHeight: 18 },
  visibiliteText: { fontSize: 18, marginLeft: 8 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  openBtn: { flex: 1, backgroundColor: COLORS.secondaryLight, padding: 10, borderRadius: 10, alignItems: 'center' },
  openBtnText: { fontSize: 13, color: COLORS.secondary, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FFEBEE', padding: 10, borderRadius: 10, alignItems: 'center', paddingHorizontal: 16 },
  deleteBtnText: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10, marginTop: 14 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#E2E8F0' },
  typeBtnActive: { backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondary },
  typeBtnIcon: { fontSize: 28, marginBottom: 4 },
  typeBtnText: { fontSize: 11, color: COLORS.text, fontWeight: '600', textAlign: 'center' },
  typeBtnTextActive: { color: COLORS.secondary },
  input: { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text },
  textAreaInput: { height: 80, textAlignVertical: 'top' },
  noteInput: { height: 120, textAlignVertical: 'top' },
  categorieGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categorieBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  categorieBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  categorieBtnText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  categorieBtnTextActive: { color: COLORS.white },
  visibiliteRow: { flexDirection: 'row', gap: 12 },
  visibiliteBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: COLORS.white },
  visibiliteBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  visibiliteBtnPriveActive: { borderColor: COLORS.warning, backgroundColor: '#FFF3E0' },
  visibiliteBtnIcon: { fontSize: 24, marginBottom: 6 },
  visibiliteBtnText: { fontSize: 13, color: COLORS.text, textAlign: 'center', fontWeight: '600' },
  visibiliteBtnTextActive: { color: COLORS.primary },
  noPatientCard: { backgroundColor: COLORS.background, borderRadius: 10, padding: 14, alignItems: 'center' },
  noPatientText: { fontSize: 13, color: COLORS.greyDark },
  patientBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: COLORS.background, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  patientBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  patientAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  patientAvatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  patientName: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  patientNameActive: { color: COLORS.primary },
  patientCheck: { fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  cancelText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.secondary },
  saveBtnDisabled: { backgroundColor: COLORS.greyDark },
  saveText: { fontSize: 15, color: COLORS.white, fontWeight: 'bold' },
});
