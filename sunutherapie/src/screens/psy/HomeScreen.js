import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator, Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';
import { apiGetConsultationsPsy } from '../../services/api';

export default function HomeScreen({ navigation }) {
  const { userProfile, logout, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(
    userProfile?.psychologue?.disponible || false
  );
  const [stats, setStats] = useState({
    en_attente: 0,
    acceptees: 0,
    terminees: 0,
    total: 0,
  });
  const [dernieresConsultations, setDernieresConsultations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiGetConsultationsPsy();
      if (res.success) {
        const data = res.data || [];
        setStats({
          en_attente: data.filter(c => c.statut === 'en_attente').length,
          acceptees: data.filter(c => c.statut === 'acceptee').length,
          terminees: data.filter(c => c.statut === 'terminee').length,
          total: data.length,
        });
        setDernieresConsultations(data.slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponibilite = async (value) => {
    setDisponible(value);
    try {
      await fetch(`${API_URL}/psychotherapeutes/${userProfile?.psychologue?.id}/disponibilite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disponible: value }),
      });
    } catch (e) {
      setDisponible(!value);
    }
  };

  const getStatutColor = (statut) => {
    const colors = { en_attente: COLORS.warning, acceptee: COLORS.success, terminee: COLORS.greyDark, refusee: COLORS.danger };
    return colors[statut] || COLORS.greyDark;
  };

  const getStatutLabel = (statut) => {
    const labels = { en_attente: '⏳ En attente', acceptee: '✅ Acceptée', terminee: '✔️ Terminée', refusee: '❌ Refusée' };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>Dr. {userProfile?.name}</Text>
            <Text style={styles.userInfo}>Psychothérapeute — GIE FUAM</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Disponibilité */}
        <View style={styles.disponibiliteCard}>
          <View>
            <Text style={styles.disponibiliteTitle}>Mon statut de disponibilité</Text>
            <Text style={[styles.disponibiliteStatus, { color: disponible ? COLORS.success : COLORS.danger }]}>
              {disponible ? '🟢 Disponible pour consultations' : '🔴 Indisponible'}
            </Text>
          </View>
          <Switch
            value={disponible}
            onValueChange={toggleDisponibilite}
            trackColor={{ false: '#E2E8F0', true: COLORS.primaryLight }}
            thumbColor={disponible ? COLORS.primary : COLORS.greyDark}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statNumber}>{stats.en_attente}</Text>
            <Text style={styles.statLabel}>⏳ En attente</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statNumber}>{stats.acceptees}</Text>
            <Text style={styles.statLabel}>✅ Acceptées</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statNumber}>{stats.terminees}</Text>
            <Text style={styles.statLabel}>✔️ Terminées</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>📊 Total</Text>
          </View>
        </View>

        {/* Dernières consultations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Dernières consultations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Consultations')}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {dernieresConsultations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune consultation pour le moment</Text>
            </View>
          ) : (
            dernieresConsultations.map((c) => (
              <View key={c.id} style={styles.consultCard}>
                <View style={styles.consultAvatar}>
                  <Text style={styles.consultAvatarText}>
                    {c.etudiant?.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>
                <View style={styles.consultInfo}>
                  <Text style={styles.consultName}>{c.etudiant?.user?.name}</Text>
                  <Text style={styles.consultDate}>
                    {c.date_consultation
                      ? new Date(c.date_consultation).toLocaleDateString('fr-FR')
                      : 'Date à confirmer'}
                  </Text>
                </View>
                <View style={[styles.statutBadge, { backgroundColor: getStatutColor(c.statut) + '20' }]}>
                  <Text style={[styles.statutText, { color: getStatutColor(c.statut) }]}>
                    {getStatutLabel(c.statut)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.secondary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginTop: 2 },
  userInfo: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoutIcon: { fontSize: 18 },
  disponibiliteCard: { margin: 16, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  disponibiliteTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  disponibiliteStatus: { fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  statCard: { width: '47%', borderRadius: 12, padding: 14, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.greyDark, marginTop: 4, textAlign: 'center' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { fontSize: 14, color: COLORS.greyDark, textAlign: 'center' },
  consultCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  consultAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  consultAvatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
  consultInfo: { flex: 1 },
  consultName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  consultDate: { fontSize: 12, color: COLORS.greyDark, marginTop: 2 },
  statutBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statutText: { fontSize: 11, fontWeight: '600' },
});
