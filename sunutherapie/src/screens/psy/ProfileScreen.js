import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
        Alert.alert('✅ Succès', 'Profil mis à jour !');
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
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const infoRow = (label, value, icon) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Non renseigné'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={styles.name}>{userProfile?.name}</Text>
          <Text style={styles.role}>👨‍⚕️ Psychothérapeute</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>GIE FUAM / UCAD</Text>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Mes informations</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editBtn}>{editing ? 'Annuler' : '✏️ Modifier'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(v) => setForm({ ...form, name: v })}
                  placeholder="Votre nom"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={form.telephone}
                  onChangeText={(v) => setForm({ ...form, telephone: v })}
                  placeholder="77 XXX XX XX"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio / Présentation</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={form.bio}
                  onChangeText={(v) => setForm({ ...form, bio: v })}
                  placeholder="Décrivez votre expertise..."
                  multiline
                  numberOfLines={4}
                />
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoCard}>
              {infoRow('Email', userProfile?.email, '📧')}
              {infoRow('Téléphone', userProfile?.telephone, '📱')}
              {infoRow('Bio', userProfile?.psychologue?.bio, '📝')}
              {infoRow('Total consultations', userProfile?.psychologue?.total_consultations?.toString(), '📊')}
            </View>
          )}
        </View>

        {/* Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', backgroundColor: COLORS.secondary, paddingVertical: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: COLORS.white },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  role: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 13, color: COLORS.white, fontWeight: '600' },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  editBtn: { fontSize: 14, color: COLORS.secondary, fontWeight: '600' },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoIcon: { fontSize: 20, marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.greyDark },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', marginTop: 2 },
  editForm: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: '#D4EDED', borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text },
  bioInput: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: COLORS.secondary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  saveBtnDisabled: { backgroundColor: COLORS.greyDark },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: COLORS.danger, fontSize: 15, fontWeight: 'bold' },
});
