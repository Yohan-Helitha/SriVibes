import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from '../../theme/colors';
import OwnerLoginScreen from './OwnerLoginScreen';
import OwnerDashboardScreen from './OwnerDashboardScreen';

export default function AccountScreen() {
  const [ownerAuthenticated, setOwnerAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleOwnerLoginSuccess = (payload: { ownerId: string; ownerType: string }) => {
    setOwnerAuthenticated(true);
    setShowLogin(false);
    setShowDashboard(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account</Text>

      <View style={styles.section}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.sub}>View and edit your profile details</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.sub}>View your booking history and receipts</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Owner Access</Text>
        {!ownerAuthenticated ? (
          <TouchableOpacity style={styles.ownerButton} onPress={() => setShowLogin(true)}>
            <Text style={styles.ownerButtonText}>Owner login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ownerButton} onPress={() => setShowDashboard(true)}>
            <Text style={styles.ownerButtonText}>Open Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showLogin} animationType="slide">
        <OwnerLoginScreen
          onSuccess={handleOwnerLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      </Modal>

      <Modal visible={showDashboard} animationType="slide">
        <OwnerDashboardScreen onClose={() => setShowDashboard(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.lightGray },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: colors.textDark },
  section: { backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  sub: { fontSize: 13, color: '#666', marginTop: 4 },
  ownerButton: { marginTop: 8, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  ownerButtonText: { color: colors.white, fontWeight: '600' },
});
