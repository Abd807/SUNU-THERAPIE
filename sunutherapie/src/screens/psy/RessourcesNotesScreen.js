import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS } from '../../config/constants';
import RessourcesScreen from './RessourcesScreen';
import NotesScreen from './NotesScreen';

export default function RessourcesNotesScreen() {
  const [onglet, setOnglet] = useState('ressources');

  return (
    <SafeAreaView style={styles.container}>

      {/* Header commun */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {onglet === 'ressources' ? '📚 Ressources' : '📝 Notes'}
        </Text>
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, onglet === 'ressources' && styles.toggleBtnActive]}
          onPress={() => setOnglet('ressources')}
        >
          <Text style={[styles.toggleText, onglet === 'ressources' && styles.toggleTextActive]}>
            📚 Ressources
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, onglet === 'notes' && styles.toggleBtnActive]}
          onPress={() => setOnglet('notes')}
        >
          <Text style={[styles.toggleText, onglet === 'notes' && styles.toggleTextActive]}>
            📝 Notes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu sans header */}
      <View style={styles.content}>
        {onglet === 'ressources' ? (
          <RessourcesScreen hideHeader={true} />
        ) : (
          <NotesScreen hideHeader={true} />
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.secondary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  toggleContainer: { flexDirection: 'row', margin: 16, backgroundColor: COLORS.grey, borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.secondary },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.greyDark },
  toggleTextActive: { color: COLORS.white },
  content: { flex: 1 },
});
