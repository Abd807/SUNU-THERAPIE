import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';

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
      const res = await fetch(`${API_URL}/forum`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        Alert.alert('✅', 'Post publié !');
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
    await fetch(`${API_URL}/forum/${id}/liker`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadPosts();
  };

  const handleSupprimer = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce post ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await fetch(`${API_URL}/forum/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          loadPosts();
        }
      },
    ]);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💬 Forum</Text>
          <Text style={styles.headerSub}>Espace de discussion étudiant</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalPost(true)}>
          <Text style={styles.addBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Liste posts */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPosts(); }} />}
        contentContainerStyle={styles.listContainer}
      >
        {posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Aucun post pour l'instant</Text>
            <Text style={styles.emptyText}>Soyez le premier à partager !</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalPost(true)}>
              <Text style={styles.emptyBtnText}>+ Créer un post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Header post */}
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>
                    {post.anonyme ? '🎭' : post.auteur?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.postAuteur}>
                    {post.auteur}
                    {post.auteur !== 'Anonyme' && userProfile?.role === 'psychologue' && (
                      <Text style={styles.psyBadge}> 👨‍⚕️</Text>
                    )}
                  </Text>
                  <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                </View>
                {post.user_id === userProfile?.id && (
                  <TouchableOpacity onPress={() => handleSupprimer(post.id)}>
                    <Text style={styles.deleteBtn}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Titre et contenu */}
              <Text style={styles.postTitre}>{post.titre}</Text>
              <Text style={styles.postContenu}>{post.contenu}</Text>

              {/* Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(post.id)}>
                  <Text style={styles.likeText}>❤️ {post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.commentBtn}
                  onPress={() => { setSelectedPost(post); setModalComment(true); }}
                >
                  <Text style={styles.commentText}>💬 {post.commentaires_count}</Text>
                </TouchableOpacity>
              </View>

              {/* Commentaires */}
              {post.commentaires?.length > 0 && (
                <View style={styles.commentaires}>
                  {post.commentaires.slice(0, 2).map((c) => (
                    <View key={c.id} style={[styles.commentCard, c.is_psy && styles.commentPsy]}>
                      <Text style={styles.commentAuteur}>
                        {c.is_psy ? '👨‍⚕️ ' : ''}{c.auteur}
                      </Text>
                      <Text style={styles.commentContenu}>{c.contenu}</Text>
                    </View>
                  ))}
                  {post.commentaires.length > 2 && (
                    <Text style={styles.voirPlus}>Voir {post.commentaires.length - 2} commentaire(s) de plus...</Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal nouveau post */}
      <Modal visible={modalPost} animationType="slide" transparent onRequestClose={() => setModalPost(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>✍️ Nouveau post</Text>

              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={formPost.titre}
                onChangeText={(v) => setFormPost({ ...formPost, titre: v })}
                placeholder="Titre de votre post"
                placeholderTextColor={COLORS.greyDark}
              />

              <Text style={styles.modalLabel}>Contenu *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formPost.contenu}
                onChangeText={(v) => setFormPost({ ...formPost, contenu: v })}
                placeholder="Partagez vos pensées..."
                placeholderTextColor={COLORS.greyDark}
                multiline
                numberOfLines={5}
              />

              <TouchableOpacity
                style={[styles.anonymeBtn, formPost.anonyme && styles.anonymeBtnActive]}
                onPress={() => setFormPost({ ...formPost, anonyme: !formPost.anonyme })}
              >
                <Text style={styles.anonymeText}>
                  {formPost.anonyme ? '🎭 Publier anonymement' : '👤 Publier avec mon nom'}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalPost(false)}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handlePost}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveText}>Publier</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal commentaire */}
      <Modal visible={modalComment} animationType="slide" transparent onRequestClose={() => setModalComment(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💬 Commenter</Text>
            {selectedPost && <Text style={styles.postTitreModal}>"{selectedPost.titre}"</Text>}

            <Text style={styles.modalLabel}>Votre commentaire *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formComment.contenu}
              onChangeText={(v) => setFormComment({ ...formComment, contenu: v })}
              placeholder="Écrivez votre commentaire..."
              placeholderTextColor={COLORS.greyDark}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.anonymeBtn, formComment.anonyme && styles.anonymeBtnActive]}
              onPress={() => setFormComment({ ...formComment, anonyme: !formComment.anonyme })}
            >
              <Text style={styles.anonymeText}>
                {formComment.anonyme ? '🎭 Commenter anonymement' : '👤 Commenter avec mon nom'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalComment(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleComment}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveText}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
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
  headerSub: { fontSize: 13, color: COLORS.primaryLight, marginTop: 4 },
  addBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  listContainer: { paddingHorizontal: 16, paddingTop: 12 },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 13, color: COLORS.greyDark, marginBottom: 16 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyBtnText: { color: COLORS.white, fontWeight: 'bold' },
  postCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  postAvatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  postMeta: { flex: 1 },
  postAuteur: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  psyBadge: { fontSize: 12 },
  postDate: { fontSize: 11, color: COLORS.greyDark, marginTop: 2 },
  deleteBtn: { fontSize: 18 },
  postTitre: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  postContenu: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeText: { fontSize: 14, color: COLORS.danger, fontWeight: '600' },
  commentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  commentaires: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  commentCard: { backgroundColor: COLORS.background, borderRadius: 10, padding: 10, marginBottom: 6 },
  commentPsy: { backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: COLORS.success },
  commentAuteur: { fontSize: 12, fontWeight: 'bold', color: COLORS.text, marginBottom: 2 },
  commentContenu: { fontSize: 13, color: COLORS.text },
  voirPlus: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  postTitreModal: { fontSize: 13, color: COLORS.greyDark, marginBottom: 14, fontStyle: 'italic', textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  anonymeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 12 },
  anonymeBtnActive: { backgroundColor: '#FFF3E0', borderColor: COLORS.warning },
  anonymeText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#E2E8F0' },
  cancelText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveBtnDisabled: { backgroundColor: COLORS.greyDark },
  saveText: { fontSize: 15, color: COLORS.white, fontWeight: 'bold' },
});
