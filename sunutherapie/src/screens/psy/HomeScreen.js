import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/constants';
import { colors, spacing, radius } from '../../config/theme';
import { Card, Avatar, Badge, SectionHeader, EmptyState } from '../../components/ui';
import { apiGetConsultationsPsy } from '../../services/api';

const STATUTS = {
  en_attente: { tone: 'warning', label: 'En attente' },
  acceptee: { tone: 'success', label: 'Acceptée' },
  terminee: { tone: 'neutral', label: 'Terminée' },
  refusee: { tone: 'danger', label: 'Refusée' },
};

export default function HomeScreen({ navigation }) {
  const { userProfile, logout, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(userProfile?.psychologue?.disponible || false);
  const [stats, setStats] = useState({ en_attente: 0, acceptees: 0, terminees: 0, total: 0 });
  const [dernieresConsultations, setDernieresConsultations] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiGetConsultationsPsy();
      if (res.success) {
        const data = res.data || [];
        setStats({
          en_attente: data.filter((c) => c.statut === 'en_attente').length,
          acceptees: data.filter((c) => c.statut === 'acceptee').length,
          terminees: data.filter((c) => c.statut === 'terminee').length,
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

  const STAT_TILES = [
    { key: 'en_attente', value: stats.en_attente, label: 'En attente', icon: 'hourglass-outline', tint: colors.warning, bg: colors.warningLight },
    { key: 'acceptees', value: stats.acceptees, label: 'Acceptées', icon: 'checkmark-circle-outline', tint: colors.success, bg: colors.successLight },
    { key: 'terminees', value: stats.terminees, label: 'Terminées', icon: 'flag-outline', tint: colors.accent, bg: colors.accentLight },
    { key: 'total', value: stats.total, label: 'Total', icon: 'stats-chart-outline', tint: colors.primary, bg: colors.primaryLight },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>Dr. {userProfile?.name}</Text>
            <Text style={styles.userInfo}>Psychothérapeute — GIE FUAM</Text>
          </View>
          <View style={styles.headerActions}>
            <Avatar name={userProfile?.name} size={44} bg="rgba(255,255,255,0.18)" fg={colors.white} />
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Disponibilité */}
        <View style={styles.dispoWrap}>
          <Card style={styles.dispoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dispoTitle}>Statut de disponibilité</Text>
              <View style={styles.dispoStatusRow}>
                <View style={[styles.dot, { backgroundColor: disponible ? colors.success : colors.danger }]} />
                <Text style={[styles.dispoStatus, { color: disponible ? colors.success : colors.danger }]}>
                  {disponible ? 'Disponible pour consultations' : 'Indisponible'}
                </Text>
              </View>
            </View>
            <Switch
              value={disponible}
              onValueChange={toggleDisponibilite}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={disponible ? colors.primary : colors.textFaint}
            />
          </Card>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {STAT_TILES.map((s) => (
            <View key={s.key} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={20} color={s.tint} />
              </View>
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Dernières consultations */}
        <View style={styles.section}>
          <SectionHeader
            title="Dernières consultations"
            actionLabel="Voir tout"
            onAction={() => navigation.navigate('Consultations')}
          />
          {dernieresConsultations.length === 0 ? (
            <EmptyState icon="calendar-outline" title="Aucune consultation" subtitle="Vous n'avez pas encore de consultations." />
          ) : (
            dernieresConsultations.map((c) => {
              const st = STATUTS[c.statut] || { tone: 'neutral', label: c.statut };
              return (
                <Card key={c.id} style={styles.consultCard}>
                  <Avatar name={c.etudiant?.user?.name} size={42} />
                  <View style={styles.consultInfo}>
                    <Text style={styles.consultName}>{c.etudiant?.user?.name}</Text>
                    <Text style={styles.consultDate}>
                      {c.date_consultation ? new Date(c.date_consultation).toLocaleDateString('fr-FR') : 'Date à confirmer'}
                    </Text>
                  </View>
                  <Badge label={st.label} tone={st.tone} />
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl,
  },
  greeting: { fontSize: 14, color: colors.primaryLight },
  userName: { fontSize: 22, fontWeight: '700', color: colors.white, marginTop: 2 },
  userInfo: { fontSize: 12, color: colors.primaryLight, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, marginLeft: spacing.sm, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },

  dispoWrap: { paddingHorizontal: spacing.lg, marginTop: -spacing.xl },
  dispoCard: { flexDirection: 'row', alignItems: 'center' },
  dispoTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  dispoStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dispoStatus: { fontSize: 13, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.md, marginTop: spacing.lg },
  statCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statNumber: { fontSize: 28, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  section: { marginHorizontal: spacing.lg, marginTop: spacing.xxl },
  consultCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  consultInfo: { flex: 1, marginLeft: spacing.md },
  consultName: { fontSize: 14, fontWeight: '700', color: colors.text },
  consultDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
