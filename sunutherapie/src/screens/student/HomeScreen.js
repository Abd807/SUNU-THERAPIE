import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, shadows } from '../../config/theme';
import { apiGetPsychotherapeutesDisponibles, apiGetConsultationsEtudiant } from '../../services/api';
import {
  Card, Avatar, Badge, SectionHeader, EmptyState, QuickAction, Button,
} from '../../components/ui';

const STATUTS = {
  en_attente: { tone: 'warning', label: 'En attente' },
  acceptee: { tone: 'success', label: 'Acceptée' },
  terminee: { tone: 'neutral', label: 'Terminée' },
  refusee: { tone: 'danger', label: 'Refusée' },
};

const formatDate = (value, withTime = false) => {
  if (!value) return 'Date à confirmer';
  const opts = withTime
    ? { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(value).toLocaleDateString('fr-FR', opts);
};

export default function HomeScreen({ navigation }) {
  const { userProfile, logout } = useAuth();
  const [psyDisponibles, setPsyDisponibles] = useState([]);
  const [consultations, setConsultations] = useState([]);
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

  const prochainRdv = consultations.find((c) => c.statut === 'acceptee');
  const prenom = (userProfile?.name || 'Étudiant').split(' ')[0];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.userName}>{prenom} 👋</Text>
              {(userProfile?.etudiant?.universite || userProfile?.etudiant?.niveau) ? (
                <View style={styles.uniRow}>
                  <Ionicons name="school-outline" size={13} color={colors.primaryLight} />
                  <Text style={styles.userInfo}>
                    {[userProfile?.etudiant?.universite, userProfile?.etudiant?.niveau].filter(Boolean).join(' — ')}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.headerActions}>
              <Avatar name={userProfile?.name} size={44} bg="rgba(255,255,255,0.18)" fg={colors.white} />
              <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Carte héro : prochain RDV ou bien-être */}
        <View style={styles.heroWrap}>
          {prochainRdv ? (
            <View style={styles.rdvCard}>
              <View style={styles.rdvHead}>
                <Ionicons name="calendar" size={16} color={colors.primaryLight} />
                <Text style={styles.rdvLabel}>Prochain rendez-vous</Text>
              </View>
              <Text style={styles.rdvPsy}>{prochainRdv.psychologue?.user?.name || 'Psychothérapeute'}</Text>
              <View style={styles.rdvDateRow}>
                <Ionicons name="time-outline" size={14} color={colors.primaryLight} />
                <Text style={styles.rdvDate}>{formatDate(prochainRdv.date_consultation, true)}</Text>
              </View>
              <Button
                label="Voir le rendez-vous"
                variant="ghost"
                size="sm"
                iconRight="arrow-forward"
                style={styles.rdvBtn}
                onPress={() => navigation.navigate('Consultations')}
              />
            </View>
          ) : (
            <Card style={styles.wellbeing} padded>
              <View style={styles.wellbeingIcon}>
                <Ionicons name="leaf-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.wellbeingTitle}>Votre bien-être compte</Text>
              <Text style={styles.wellbeingText}>
                Prenez soin de votre santé mentale. Parlez à un psychothérapeute dès aujourd'hui, en toute confidentialité.
              </Text>
              <Button
                label="Prendre un rendez-vous"
                size="sm"
                icon="add"
                style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
                onPress={() => navigation.navigate('Consultations')}
              />
            </Card>
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsRow}>
          <QuickAction icon="calendar-outline" label="Prendre RDV" onPress={() => navigation.navigate('Consultations')} />
          <QuickAction icon="sparkles-outline" label="Assistant IA" tint={colors.accent} tintBg={colors.accentLight} onPress={() => navigation.navigate('Assistant')} />
          <QuickAction icon="chatbubbles-outline" label="Forum" tint={colors.success} tintBg={colors.successLight} onPress={() => navigation.navigate('Forum')} />
          <QuickAction icon="library-outline" label="Ressources" tint={colors.warning} tintBg={colors.warningLight} onPress={() => navigation.navigate('Ressources')} />
        </View>

        {/* Psychothérapeutes disponibles */}
        <View style={styles.section}>
          <SectionHeader
            title="Psy disponibles"
            actionLabel="Voir tout"
            onAction={() => navigation.navigate('Consultations')}
          />
          {psyDisponibles.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Aucun psy disponible"
              subtitle="Aucun psychothérapeute n'est disponible pour le moment. Revenez un peu plus tard."
            />
          ) : (
            psyDisponibles.map((psy) => (
              <Card
                key={psy.id}
                style={styles.psyCard}
                onPress={() => navigation.navigate('Consultations', { psyId: psy.id })}
              >
                <Avatar name={psy.user?.name} size={48} online />
                <View style={styles.psyInfo}>
                  <Text style={styles.psyName}>{psy.user?.name}</Text>
                  <Text style={styles.psySpecialite}>Psychothérapeute — GIE FUAM</Text>
                  <Badge label="Disponible" tone="success" dot style={{ marginTop: 6 }} />
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
              </Card>
            ))
          )}
        </View>

        {/* Mes consultations */}
        <View style={styles.section}>
          <SectionHeader
            title="Mes consultations"
            actionLabel="Voir tout"
            onAction={() => navigation.navigate('Consultations')}
          />
          {consultations.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title="Pas encore de consultations"
              subtitle="Prenez votre premier rendez-vous pour démarrer votre suivi."
              actionLabel="Prendre un RDV"
              onAction={() => navigation.navigate('Consultations')}
            />
          ) : (
            consultations.map((c) => {
              const st = STATUTS[c.statut] || { tone: 'neutral', label: c.statut };
              return (
                <Card key={c.id} style={styles.consultCard}>
                  <Avatar name={c.psychologue?.user?.name} size={42} />
                  <View style={styles.psyInfo}>
                    <Text style={styles.consultPsy}>{c.psychologue?.user?.name}</Text>
                    <Text style={styles.consultDate}>{formatDate(c.date_consultation)}</Text>
                  </View>
                  <Badge label={st.label} tone={st.tone} />
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bouton flottant Assistant IA */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Assistant')} activeOpacity={0.9}>
        <Ionicons name="sparkles" size={20} color={colors.white} />
        <Text style={styles.fabText}>Assistant</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  greeting: { fontSize: 14, color: colors.primaryLight },
  userName: { fontSize: 24, fontWeight: '700', color: colors.white, marginTop: 2 },
  uniRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  userInfo: { fontSize: 12, color: colors.primaryLight, marginLeft: 5 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20, marginLeft: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
  },

  heroWrap: { paddingHorizontal: spacing.lg, marginTop: -spacing.xl },
  rdvCard: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: spacing.lg, ...shadows.md },
  rdvHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  rdvLabel: { fontSize: 12, fontWeight: '600', color: colors.primaryLight, marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  rdvPsy: { fontSize: 18, fontWeight: '700', color: colors.white },
  rdvDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  rdvDate: { fontSize: 13, color: colors.primaryLight, marginLeft: 6, textTransform: 'capitalize' },
  rdvBtn: { marginTop: spacing.md, alignSelf: 'flex-start' },

  wellbeing: { ...shadows.md },
  wellbeingIcon: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  wellbeingTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  wellbeingText: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 4 },

  actionsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.xl },

  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  psyCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  psyInfo: { flex: 1, marginLeft: spacing.md },
  psyName: { fontSize: 15, fontWeight: '700', color: colors.text },
  psySpecialite: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  consultCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  consultPsy: { fontSize: 14, fontWeight: '700', color: colors.text },
  consultDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xxl,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: radius.full, ...shadows.lg,
  },
  fabText: { color: colors.white, fontSize: 15, fontWeight: '700', marginLeft: 8 },
});
