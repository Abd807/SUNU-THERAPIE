import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Avatar, Badge, Button, EmptyState } from '../../components/ui';

const TYPES = [
  { key: 'video', label: 'Vidéo', icon: 'videocam-outline' },
  { key: 'pdf', label: 'PDF', icon: 'document-outline' },
  { key: 'note', label: 'Note', icon: 'document-text-outline' },
];

const CATEGORIES = [
  { key: 'anxiete', label: 'Anxiété' },
  { key: 'depression', label: 'Dépression' },
  { key: 'stress', label: 'Stress' },
  { key: 'sommeil', label: 'Sommeil' },
  { key: 'confiance', label: 'Confiance' },
  { key: 'deuil', label: 'Deuil' },
  { key: 'autre', label: 'Autre' },
];

const getTypeIcon = (type) => (type === 'note' ? 'document-text-outline' : type === 'pdf' ? 'document-outline' : 'videocam-outline');
const getCategorieLabel = (cat) => CATEGORIES.find((c) => c.key === cat)?.label || cat;

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
        (data.data || []).forEach((c) => { if (c.etudiant && !ids.has(c.etudiant.id)) { ids.add(c.etudiant.id); etudiants.push(c.etudiant); } });
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
      if (data.success) { setModalVisible(false); resetForm(); loadRessources(); Alert.alert('Ajoutée', 'Ressource ajoutée !'); }
      else Alert.alert('Erreur', data.message || 'Erreur');
    } catch (error) { Alert.alert('Erreur', 'Erreur réseau'); } finally { setSaving(false); }
  };

  const handleSupprimer = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette ressource ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await fetch(`${API_URL}/ressources/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); loadRessources(); } },
    ]);
  };

  const ressourcesFiltrees = filtreType === 'all' ? ressources : ressources.filter((r) => {
    if (filtreType === 'video') return r.type === 'lien_youtube' || r.type === 'lien_web';
    if (filtreType === 'pdf') return r.type === 'pdf';
    if (filtreType === 'note') return r.type === 'note';
    return true;
  });

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      {!hideHeader ? (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mes Ressources</Text>
            <Text style={styles.headerSub}>{ressources.length} ressource(s)</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.addBtnRow}>
          <Text style={styles.countText}>{ressources.length} ressource(s)</Text>
          <TouchableOpacity style={styles.addBtnSmall} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.addBtnSmallText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtresContainer}>
          {[{ key: 'all', label: 'Tout' }, ...TYPES].map((f) => (
            <TouchableOpacity key={f.key} style={[styles.filtreBtn, filtreType === f.key && styles.filtreBtnActive]} onPress={() => setFiltreType(f.key)} activeOpacity={0.8}>
              <Text style={[styles.filtreText, filtreType === f.key && styles.filtreTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {ressourcesFiltrees.length === 0 ? (
          <EmptyState icon="library-outline" title="Aucune ressource" subtitle="Ajoutez des ressources pour vos patients." actionLabel="Ajouter" onAction={() => setModalVisible(true)} style={{ marginTop: spacing.lg }} />
        ) : (
          ressourcesFiltrees.map((r) => (
            <Card key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeIcon}>
                  <Ionicons name={getTypeIcon(r.type)} size={22} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitre}>{r.titre}</Text>
                  <View style={styles.metaRow}>
                    <Badge label={getCategorieLabel(r.categorie)} tone="primary" />
                    <Badge label={r.public ? 'Public' : 'Privé'} tone={r.public ? 'success' : 'warning'} dot />
                  </View>
                  {r.description ? <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text> : null}
                </View>
              </View>
              <View style={styles.cardActions}>
                {r.url ? (
                  <TouchableOpacity style={styles.openBtn} onPress={() => Linking.openURL(r.url)} activeOpacity={0.85}>
                    <Ionicons name="open-outline" size={16} color={colors.primary} />
                    <Text style={styles.openBtnText}>Ouvrir</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleSupprimer(r.id)} activeOpacity={0.85}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Nouvelle ressource</Text>

              <Text style={styles.modalLabel}>Type</Text>
              <View style={styles.typeRow}>
                {TYPES.map((t) => (
                  <TouchableOpacity key={t.key} style={[styles.typeBtn, form.type === t.key && styles.typeBtnActive]} onPress={() => setForm({ ...form, type: t.key })} activeOpacity={0.85}>
                    <Ionicons name={t.icon} size={24} color={form.type === t.key ? colors.primary : colors.textMuted} />
                    <Text style={[styles.typeBtnText, form.type === t.key && { color: colors.primaryDark }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput style={styles.input} value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} placeholder="Titre de la ressource" placeholderTextColor={colors.textFaint} />

              {form.type !== 'note' ? (
                <>
                  <Text style={styles.modalLabel}>{form.type === 'video' ? 'Lien YouTube / Vidéo *' : 'Lien PDF *'}</Text>
                  <TextInput style={styles.input} value={form.lien} onChangeText={(v) => setForm({ ...form, lien: v })} placeholder="https://…" placeholderTextColor={colors.textFaint} autoCapitalize="none" keyboardType="url" />
                  <Text style={styles.modalLabel}>Description (optionnel)</Text>
                  <TextInput style={[styles.input, styles.textAreaInput]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Décrivez cette ressource…" placeholderTextColor={colors.textFaint} multiline numberOfLines={3} />
                </>
              ) : (
                <>
                  <Text style={styles.modalLabel}>Texte *</Text>
                  <TextInput style={[styles.input, styles.noteInput]} value={form.note_texte} onChangeText={(v) => setForm({ ...form, note_texte: v })} placeholder="Écrivez votre note ici…" placeholderTextColor={colors.textFaint} multiline numberOfLines={6} />
                </>
              )}

              <Text style={styles.modalLabel}>Catégorie</Text>
              <View style={styles.wrapRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity key={c.key} style={[styles.chipBtn, form.categorie === c.key && styles.chipBtnActive]} onPress={() => setForm({ ...form, categorie: c.key })} activeOpacity={0.8}>
                    <Text style={[styles.chipText, form.categorie === c.key && styles.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Partager avec</Text>
              <View style={styles.visibiliteRow}>
                <TouchableOpacity style={[styles.visibiliteBtn, form.visibilite === 'public' && styles.visibiliteBtnActive]} onPress={() => setForm({ ...form, visibilite: 'public', patient_id: null })} activeOpacity={0.85}>
                  <Ionicons name="earth" size={22} color={form.visibilite === 'public' ? colors.primary : colors.textMuted} />
                  <Text style={[styles.visibiliteBtnText, form.visibilite === 'public' && { color: colors.primaryDark }]}>Tous mes patients</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.visibiliteBtn, form.visibilite === 'prive' && styles.visibiliteBtnPriveActive]} onPress={() => setForm({ ...form, visibilite: 'prive' })} activeOpacity={0.85}>
                  <Ionicons name="lock-closed" size={22} color={form.visibilite === 'prive' ? colors.warning : colors.textMuted} />
                  <Text style={[styles.visibiliteBtnText, form.visibilite === 'prive' && { color: colors.warning }]}>Un patient</Text>
                </TouchableOpacity>
              </View>

              {form.visibilite === 'prive' ? (
                <>
                  <Text style={styles.modalLabel}>Choisir le patient</Text>
                  {patients.length === 0 ? (
                    <View style={styles.noPatientCard}><Text style={styles.noPatientText}>Aucun patient trouvé</Text></View>
                  ) : (
                    patients.map((p) => {
                      const active = form.patient_id === p.id;
                      return (
                        <TouchableOpacity key={p.id} style={[styles.patientBtn, active && styles.patientBtnActive]} onPress={() => setForm({ ...form, patient_id: p.id })} activeOpacity={0.85}>
                          <Avatar name={p.user?.name} size={36} />
                          <Text style={[styles.patientName, active && { color: colors.primaryDark }]}>{p.user?.name || 'Patient'}</Text>
                          {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              ) : null}

              <View style={styles.modalActions}>
                <Button label="Annuler" variant="outline" onPress={() => { setModalVisible(false); resetForm(); }} style={{ flex: 1 }} />
                <Button label="Enregistrer" onPress={handleSauvegarder} loading={saving} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  filtresContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filtreBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtreText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  filtreTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  typeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardInfo: { flex: 1 },
  cardTitre: { fontSize: 15, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 6, flexWrap: 'wrap' },
  cardDesc: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  openBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primaryLight, padding: 10, borderRadius: radius.md },
  openBtnText: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  deleteBtn: { backgroundColor: colors.dangerLight, paddingHorizontal: 16, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: { flex: 1, alignItems: 'center', gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border },
  typeBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  typeBtnText: { fontSize: 12, color: colors.text, fontWeight: '600', textAlign: 'center' },
  input: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text },
  textAreaInput: { height: 80, textAlignVertical: 'top' },
  noteInput: { height: 120, textAlignVertical: 'top' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  visibiliteRow: { flexDirection: 'row', gap: spacing.md },
  visibiliteBtn: { flex: 1, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  visibiliteBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  visibiliteBtnPriveActive: { borderColor: colors.warning, backgroundColor: colors.warningLight },
  visibiliteBtnText: { fontSize: 13, color: colors.text, textAlign: 'center', fontWeight: '600' },
  noPatientCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  noPatientText: { fontSize: 13, color: colors.textMuted },
  patientBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  patientBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  patientName: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
