import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

type Bus = {
  id: string;
  expressName: string;
  busNumber: string;
  seats: number;
  routeNumber: string;
  passingCities: string[];
  startPoint?: string;
  endPoint?: string;
  turns: Array<{ start: string; end: string; conductorId?: string; driverId?: string }>;
};

type Props = {
  buses: Bus[];
};

export default function FinanceTab({ buses }: Props) {
  return (
    <View style={styles.container}>
      <View style={{ marginTop: 12, flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.sectionHeading}>Finance</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <TouchableOpacity 
            style={[styles.smallBtn, { marginRight: 8 }]} 
            onPress={() => { /* filter today */ }}
          >
            <Text style={styles.smallBtnText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.smallBtn, { marginRight: 8 }]} 
            onPress={() => { /* yesterday */ }}
          >
            <Text style={styles.smallBtnText}>Yesterday</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.smallBtn, { marginRight: 8 }]} 
            onPress={() => { /* week */ }}
          >
            <Text style={styles.smallBtnText}>Past Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.smallBtn]} 
            onPress={() => { /* month */ }}
          >
            <Text style={styles.smallBtnText}>Past Month</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: '#666' }}>
          No booking data available yet. Connect bookings to calculate income per turn.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.textDark },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.primary },
  smallBtnText: { color: colors.primary },
});
