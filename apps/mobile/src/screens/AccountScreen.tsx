import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import OwnerLoginScreen from './OwnerLoginScreen';
import BusOwnerDashboardScreen from './BusOwnerDashboardScreen';

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const [ownerAuthenticated, setOwnerAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('account');

  const handleOwnerLoginSuccess = (payload: { ownerId: string; ownerType: string }) => {
    setOwnerAuthenticated(true);
    setShowLogin(false);
    setShowDashboard(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSRI}>SRI</Text>
          <Text style={styles.logoVibes}>Vibes</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={colors.white} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.location}>Colombo, Sri Lanka</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => { /* open edit flow */ }}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Favourites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.optionRow} onPress={() => { /* navigate to profile edit */ }}>
        <View style={styles.optionLeft}>
          <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.optionTitle}>Profile</Text>
            <Text style={styles.optionSub}>View and edit your profile details</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionRow} onPress={() => { /* navigate bookings */ }}>
        <View style={styles.optionLeft}>
          <Ionicons name="receipt-outline" size={28} color={colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.optionTitle}>Bookings</Text>
            <Text style={styles.optionSub}>View your booking history and receipts</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => { ownerAuthenticated ? setShowDashboard(true) : setShowLogin(true); }}
      >
        <View style={styles.optionLeft}>
          <Ionicons name="business-outline" size={28} color={colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.optionTitle}>Owner Access</Text>
            <Text style={styles.optionSub}>Open owner dashboard or sign in</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => { setActiveTab('home'); navigation.navigate('Home'); }}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'home' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'home' && styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('favourite')}
        >
          <Ionicons
            name={activeTab === 'favourite' ? 'heart' : 'heart-outline'}
            size={24}
            color={activeTab === 'favourite' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'favourite' && styles.navTextActive,
            ]}
          >
            Favourite
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('bookings')}
        >
          <MaterialIcons
            name="receipt-long"
            size={24}
            color={activeTab === 'bookings' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'bookings' && styles.navTextActive,
            ]}
          >
            bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('account')}
        >
          <Ionicons
            name={activeTab === 'account' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'account' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'account' && styles.navTextActive,
            ]}
          >
            My Account
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showLogin} animationType="slide">
        <OwnerLoginScreen
          onSuccess={handleOwnerLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      </Modal>

      <Modal visible={showDashboard} animationType="slide">
        <BusOwnerDashboardScreen onClose={() => setShowDashboard(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, borderRadius: 12, marginBottom: 12 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  location: { fontSize: 13, color: '#666', marginTop: 4 },
  editButton: { backgroundColor: colors.veryLightBlue, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { flex: 1, backgroundColor: colors.white, marginHorizontal: 4, padding: 12, borderRadius: 10, alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, padding: 12, borderRadius: 10, marginBottom: 10 },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  optionSub: { fontSize: 13, color: '#666', marginTop: 2 },
  ownerButton: { marginLeft: 12, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  ownerButtonText: { color: colors.white, fontWeight: '600' },
  /* header matching HomeScreen */
  appHeader: { backgroundColor: colors.primary, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center'},
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoSRI: { fontSize: 28, color: colors.white, fontFamily: 'Montserrat-ExtraBold' },
  logoVibes: { fontSize: 28, color: colors.white, fontFamily: 'Montserrat-SemiBold', marginLeft: 4 },
  notificationButton: { position: 'absolute', right: 20, top: 50, padding: 8 },
  contentContainer: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, flex: 1 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
