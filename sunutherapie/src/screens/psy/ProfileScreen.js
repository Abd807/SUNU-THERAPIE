import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Avatar, Button } from '../../components/ui';

export default function ProfileScreen() {
  const { userProfile, logout, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: userProfile?.name || '',
    telephone: userProfile?.telephone || '',
    bio: userProfile?.psychologue?.bio || '',
  });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
        Alert.alert('Succès', 'Profil mis à jour !');
        setEditing(false);
      } else {
        Alert.alert('Erreur', data.message || 'Erreur mise à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const InfoRow = ({ icon, label, value, last }) => (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Non renseigné'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* En-tête */}
        <View style={styles.header}>
          <Avatar name={userProfile?.name} size={84} bg="rgba(255,255,255,0.22)" fg={colors.white} />
          <Text style={styles.name}>Dr. {userProfile?.name}</Text>
          <View style={styles.roleRow}>
            <Ionicons name="medkit" size={14} color={colors.primaryLight} />
            <Text style={styles.role}>Psychothérapeute</Text>
          </View>
          <View style={styles.headBadge}><Text style={styles.headBadgeText}>GIE FUAM / UCAD</Text></View>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes informations</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editBtn} activeOpacity={0.7}>
              <Ionicons name={editing ? 'close' : 'create-outline'} size={16} color={colors.primary} />
              <Text style={styles.editBtnText}>{editing ? 'Annuler' : 'Modifier'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Votre nom" placeholderTextColor={colors.textFaint} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput style={styles.input} value={form.telephone} onChangeText={(v) => setForm({ ...form, telephone: v })} placeholder="77 XXX XX XX" placeholderTextColor={colors.textFaint} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio / Présentation</Text>
                <TextInput style={[styles.input, styles.bioInput]} value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} placeholder="Décrivez votre expertise…" placeholderTextColor={colors.textFaint} multiline numberOfLines={4} />
              </View>
              <Button label="Enregistrer" icon="checkmark" loading={loading} onPress={handleUpdate} full />
            </Card>
          ) : (
            <Card padded={false} style={styles.infoCard}>
              <InfoRow icon="mail-outline" label="Email" value={userProfile?.email} />
              <InfoRow icon="call-outline" label="Téléphone" value={userProfile?.telephone} />
              <InfoRow icon="document-text-outline" label="Bio" value={userProfile?.psychologue?.bio} />
              <InfoRow icon="stats-chart-outline" label="Total consultations" value={userProfile?.psychologue?.total_consultations?.toString()} last />
            </Card>
          )}
        </View>

        {/* Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', backgroundColor: colors.primary, paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  name: { fontSize: 22, fontWeight: '700', color: colors.white, marginTop: spacing.md },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 },
  role: { fontSize: 14, color: colors.primaryLight },
  headBadge: { backgroundColor: 'rgba(255,255,255,0.20)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, marginTop: spacing.md },
  headBadgeText: { fontSize: 13, color: colors.white, fontWeight: '600' },
  section: { marginHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  editBtnText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  infoCard: { paddingHorizontal: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: colors.textMuted },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 15, color: colors.text },
  bioInput: { height: 100, textAlignVertical: 'top' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.dangerLight, borderRadius: radius.md, padding: 16 },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
