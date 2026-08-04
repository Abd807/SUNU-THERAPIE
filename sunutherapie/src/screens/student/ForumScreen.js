import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Avatar, Button, EmptyState } from '../../components/ui';

export default function ForumScreen() {
  const { token, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalPost, setModalPost] = useState(false);
  const [modalComment, setModalComment] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formPost, setFormPost] = useState({ titre: '', contenu: '', anonyme: false });
  const [formComment, setFormComment] = useState({ contenu: '', anonyme: false });

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/forum`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPosts(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePost = async () => {
    if (!formPost.titre.trim()) { Alert.alert('Erreur', 'Le titre est requis'); return; }
    if (!formPost.contenu.trim()) { Alert.alert('Erreur', 'Le contenu est requis'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/forum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formPost),
      });
      const data = await res.json();
      if (data.success) {
        setModalPost(false);
        setFormPost({ titre: '', contenu: '', anonyme: false });
        loadPosts();
        Alert.alert('Publié', 'Post publié !');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleComment = async () => {
    if (!formComment.contenu.trim()) { Alert.alert('Erreur', 'Le commentaire est requis'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/forum/${selectedPost.id}/commenter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formComment),
      });
      const data = await res.json();
      if (data.success) {
        setModalComment(false);
        setFormComment({ contenu: '', anonyme: false });
        loadPosts();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (id) => {
    await fetch(`${API_URL}/forum/${id}/liker`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    loadPosts();
  };

  const handleSupprimer = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce post ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await fetch(`${API_URL}/forum/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          loadPosts();
        },
      },
    ]);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

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
        <View>
          <Text style={styles.headerTitle}>Forum</Text>
          <Text style={styles.headerSub}>Espace de discussion étudiant</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalPost(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPosts(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.listContainer}
      >
        {posts.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="Aucun post pour l'instant"
            subtitle="Soyez le premier à partager avec la communauté !"
            actionLabel="Créer un post"
            onAction={() => setModalPost(true)}
            style={{ marginTop: spacing.xl }}
          />
        ) : (
          posts.map((post) => (
            <Card key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                {post.anonyme ? (
                  <View style={styles.anonAvatar}>
                    <Ionicons name="eye-off-outline" size={18} color={colors.textMuted} />
                  </View>
                ) : (
                  <Avatar name={post.auteur} size={40} />
                )}
                <View style={styles.postMeta}>
                  <View style={styles.auteurRow}>
                    <Text style={styles.postAuteur}>{post.auteur}</Text>
                    {post.auteur !== 'Anonyme' && userProfile?.role === 'psychologue' ? (
                      <Ionicons name="medkit" size={13} color={colors.accent} style={{ marginLeft: 4 }} />
                    ) : null}
                  </View>
                  <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                </View>
                {post.user_id === userProfile?.id ? (
                  <TouchableOpacity onPress={() => handleSupprimer(post.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.postTitre}>{post.titre}</Text>
              <Text style={styles.postContenu}>{post.contenu}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)} activeOpacity={0.7}>
                  <Ionicons name="heart-outline" size={18} color={colors.danger} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => { setSelectedPost(post); setModalComment(true); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={17} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>{post.commentaires_count}</Text>
                </TouchableOpacity>
              </View>

              {post.commentaires?.length > 0 ? (
                <View style={styles.commentaires}>
                  {post.commentaires.slice(0, 2).map((c) => (
                    <View key={c.id} style={[styles.commentCard, c.is_psy && styles.commentPsy]}>
                      <View style={styles.commentAuteurRow}>
                        {c.is_psy ? <Ionicons name="medkit" size={12} color={colors.success} style={{ marginRight: 4 }} /> : null}
                        <Text style={styles.commentAuteur}>{c.auteur}</Text>
                      </View>
                      <Text style={styles.commentContenu}>{c.contenu}</Text>
                    </View>
                  ))}
                  {post.commentaires.length > 2 ? (
                    <Text style={styles.voirPlus}>Voir {post.commentaires.length - 2} commentaire(s) de plus…</Text>
                  ) : null}
                </View>
              ) : null}
            </Card>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal nouveau post */}
      <Modal visible={modalPost} animationType="slide" transparent onRequestClose={() => setModalPost(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Nouveau post</Text>

              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={formPost.titre}
                onChangeText={(v) => setFormPost({ ...formPost, titre: v })}
                placeholder="Titre de votre post"
                placeholderTextColor={colors.textFaint}
              />

              <Text style={styles.modalLabel}>Contenu *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formPost.contenu}
                onChangeText={(v) => setFormPost({ ...formPost, contenu: v })}
                placeholder="Partagez vos pensées…"
                placeholderTextColor={colors.textFaint}
                multiline
                numberOfLines={5}
              />

              <TouchableOpacity
                style={[styles.anonymeBtn, formPost.anonyme && styles.anonymeBtnActive]}
                onPress={() => setFormPost({ ...formPost, anonyme: !formPost.anonyme })}
                activeOpacity={0.85}
              >
                <Ionicons name={formPost.anonyme ? 'eye-off' : 'person'} size={16} color={formPost.anonyme ? colors.warning : colors.textMuted} />
                <Text style={styles.anonymeText}>{formPost.anonyme ? 'Publier anonymement' : 'Publier avec mon nom'}</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <Button label="Annuler" variant="outline" onPress={() => setModalPost(false)} style={{ flex: 1 }} />
                <Button label="Publier" onPress={handlePost} loading={saving} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal commentaire */}
      <Modal visible={modalComment} animationType="slide" transparent onRequestClose={() => setModalComment(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Commenter</Text>
            {selectedPost ? <Text style={styles.postTitreModal}>"{selectedPost.titre}"</Text> : null}

            <Text style={styles.modalLabel}>Votre commentaire *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formComment.contenu}
              onChangeText={(v) => setFormComment({ ...formComment, contenu: v })}
              placeholder="Écrivez votre commentaire…"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.anonymeBtn, formComment.anonyme && styles.anonymeBtnActive]}
              onPress={() => setFormComment({ ...formComment, anonyme: !formComment.anonyme })}
              activeOpacity={0.85}
            >
              <Ionicons name={formComment.anonyme ? 'eye-off' : 'person'} size={16} color={formComment.anonyme ? colors.warning : colors.textMuted} />
              <Text style={styles.anonymeText}>{formComment.anonyme ? 'Commenter anonymement' : 'Commenter avec mon nom'}</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <Button label="Annuler" variant="outline" onPress={() => setModalComment(false)} style={{ flex: 1 }} />
              <Button label="Envoyer" onPress={handleComment} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  listContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  postCard: { marginBottom: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  anonAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  postMeta: { flex: 1, marginLeft: spacing.md },
  auteurRow: { flexDirection: 'row', alignItems: 'center' },
  postAuteur: { fontSize: 14, fontWeight: '700', color: colors.text },
  postDate: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  postTitre: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  postContenu: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.md },
  postActions: { flexDirection: 'row', gap: spacing.xl, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 14, fontWeight: '700' },
  commentaires: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  commentCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 10, marginBottom: 6 },
  commentPsy: { backgroundColor: colors.successLight, borderLeftWidth: 3, borderLeftColor: colors.success },
  commentAuteurRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  commentAuteur: { fontSize: 12, fontWeight: '700', color: colors.text },
  commentContenu: { fontSize: 13, color: colors.text },
  voirPlus: { fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  postTitreModal: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic', textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  anonymeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  anonymeBtnActive: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  anonymeText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
