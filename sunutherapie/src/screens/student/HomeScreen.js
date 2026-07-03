import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config/constants';
import { apiGetPsychotherapeutesDisponibles, apiGetConsultationsEtudiant } from '../../services/api';

export default function HomeScreen({ navigation }) {
  const { userProfile, logout } = useAuth();
  const [psyDisponibles, setPsyDisponibles] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [psyRes, consultRes] = await Promise.all([
        apiGetPsychotherapeutesDisponibles(),
        apiGetConsultationsEtudiant(),
      ]);
      if (psyRes.success) setPsyDisponibles(psyRes.data?.slice(0, 3) || []);
      if (consultRes.success) setConsultations(consultRes.data?.slice(0, 3) || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente': return COLORS.warning;
      case 'acceptee': return COLORS.success;
      case 'terminee': return COLORS.greyDark;
      case 'refusee': return COLORS.danger;
      default: return COLORS.greyDark;
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'en_attente': return '⏳ En attente';
      case 'acceptee': return '✅ Acceptée';
      case 'terminee': return '✔️ Terminée';
      case 'refusee': return '❌ Refusée';
      default: return statut;
    }
  };

  const prochainRdv = consultations.find(c => c.statut === 'acceptee');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>{userProfile?.name || 'Étudiant'}</Text>
            <Text style={styles.userInfo}>
              {userProfile?.etudiant?.universite} — {userProfile?.etudiant?.niveau}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Prochain RDV */}
        {prochainRdv ? (
          <View style={styles.rdvCard}>
            <Text style={styles.rdvTitle}>📅 Prochain rendez-vous</Text>
            <Text style={styles.rdvPsy}>👨‍⚕️ {prochainRdv.psychologue?.user?.name}</Text>
            <Text style={styles.rdvDate}>
              {prochainRdv.date_consultation
                ? new Date(prochainRdv.date_consultation).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                  })
                : 'Date à confirmer'}
            </Text>
          </View>
        ) : (
          <View style={styles.mentalHealthCard}>
            <Text style={styles.mentalHealthTitle}>🌿 Votre bien-être compte</Text>
            <Text style={styles.mentalHealthText}>
              Prenez soin de votre santé mentale. Consultez un psychothérapeute dès aujourd'hui.
            </Text>
          </View>
        )}

        {/* Psychothérapeutes disponibles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👨‍⚕️ Psy disponibles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Consultations')}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {psyDisponibles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun psychothérapeute disponible pour le moment</Text>
            </View>
          ) : (
            psyDisponibles.map((psy) => (
              <TouchableOpacity
                key={psy.id}
                style={styles.psyCard}
                onPress={() => navigation.navigate('Consultations', { psyId: psy.id })}
                activeOpacity={0.8}
              >
                <View style={styles.psyAvatar}>
                  <Text style={styles.psyAvatarText}>
                    {psy.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>
                <View style={styles.psyInfo}>
                  <Text style={styles.psyName}>{psy.user?.name}</Text>
                  <Text style={styles.psySpecialite}>Psychothérapeute — GIE FUAM</Text>
                  <View style={styles.psyBadge}>
                    <View style={styles.disponibleDot} />
                    <Text style={styles.disponibleText}>Disponible</Text>
                  </View>
                </View>
                <Text style={styles.psyArrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Dernières consultations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Mes consultations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Consultations')}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {consultations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Pas encore de consultations</Text>
              <TouchableOpacity
                style={styles.firstConsultBtn}
                onPress={() => navigation.navigate('Consultations')}
              >
                <Text style={styles.firstConsultText}>Prendre un RDV</Text>
              </TouchableOpacity>
            </View>
          ) : (
            consultations.map((c) => (
              <View key={c.id} style={styles.consultCard}>
                <View style={styles.consultAvatar}>
                  <Text style={styles.consultAvatarText}>
                    {c.psychologue?.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>
                <View style={styles.consultInfo}>
                  <Text style={styles.consultPsy}>{c.psychologue?.user?.name}</Text>
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

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bouton flottant Assistant IA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Assistant')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>✨</Text>
        <Text style={styles.fabText}>Assistant</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: COLORS.primary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: COLORS.primaryLight },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginTop: 2 },
  userInfo: { fontSize: 12, color: COLORS.primaryLight, marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoutIcon: { fontSize: 18 },
  rdvCard: { margin: 16, padding: 16, backgroundColor: COLORS.primary, borderRadius: 16 },
  rdvTitle: { fontSize: 13, color: COLORS.primaryLight, marginBottom: 6 },
  rdvPsy: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  rdvDate: { fontSize: 13, color: COLORS.primaryLight, textTransform: 'capitalize' },
  mentalHealthCard: { margin: 16, padding: 16, backgroundColor: COLORS.primaryLight, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  mentalHealthTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 6 },
  mentalHealthText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { fontSize: 14, color: COLORS.greyDark, textAlign: 'center', marginBottom: 12 },
  firstConsultBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  firstConsultText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  psyCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  psyAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  psyAvatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  psyInfo: { flex: 1 },
  psyName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  psySpecialite: { fontSize: 12, color: COLORS.greyDark, marginTop: 2 },
  psyBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  disponibleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 4 },
  disponibleText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  psyArrow: { fontSize: 18, color: COLORS.greyDark },
  consultCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  consultAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  consultAvatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  consultInfo: { flex: 1 },
  consultPsy: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  consultDate: { fontSize: 12, color: COLORS.greyDark, marginTop: 2 },
  statutBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statutText: { fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { fontSize: 20, marginRight: 8 },
  fabText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
