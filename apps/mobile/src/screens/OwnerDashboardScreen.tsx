import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type Props = { onClose: () => void };

export default function OwnerDashboardScreen({ onClose }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Owner Dashboard (Preview)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business Overview</Text>
        <Text style={styles.cardSub}>Revenue, bookings summary and recent activity</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manage Buses / Staff</Text>
        <Text style={styles.cardSub}>Add or assign drivers and conductors</Text>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.lightGray },
  heading: { fontSize: 20, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  card: { backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontWeight: '600', color: colors.textDark },
  cardSub: { color: '#666', marginTop: 4 },
  closeButton: { marginTop: 20, alignItems: 'center' },
  closeText: { color: colors.primary, fontWeight: '600' },
});
