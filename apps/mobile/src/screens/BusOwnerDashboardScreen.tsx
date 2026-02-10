import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ManageDriversTab, { ManageDriversTabRef } from './tabs/ManageDriversTab';
import ManageBusesTab, { ManageBusesTabRef } from './tabs/ManageBusesTab';
import FinanceTab from './tabs/FinanceTab';

type Props = { onClose: () => void; ownerType?: string };

type Person = { id: string; nic?: string; name: string; phone?: string; age?: string };
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

export default function BusOwnerDashboardScreen({ onClose }: Props) {
  const [drivers, setDrivers] = useState<Person[]>([]);
  const [conductors, setConductors] = useState<Person[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [currentPage, setCurrentPage] = useState<'people' | 'buses' | 'finance'>('people');
  
  const driversTabRef = useRef<ManageDriversTabRef>(null);
  const busesTabRef = useRef<ManageBusesTabRef>(null);

  const handleFloatingButtonPress = () => {
    if (currentPage === 'people') {
      driversTabRef.current?.openAddForm();
    } else if (currentPage === 'buses') {
      busesTabRef.current?.openAddForm();
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.appHeader}> 
            <View style={styles.logoContainer}>
              <Text style={styles.logoSRI}>SRI</Text>
              <Text style={styles.logoVibes}>Vibes</Text>
            </View>
            <Text style={styles.headerSub}>Dashboard</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 12, marginTop: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => setCurrentPage('people')} style={[styles.tabButton, currentPage === 'people' && styles.tabActive]}>
                <Text style={[styles.tabText, currentPage === 'people' && styles.tabTextActive]}>Manage Drivers</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentPage('buses')} style={[styles.tabButton, currentPage === 'buses' && styles.tabActive]}>
                <Text style={[styles.tabText, currentPage === 'buses' && styles.tabTextActive]}>Manage Buses</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentPage('finance')} style={[styles.tabButton, currentPage === 'finance' && styles.tabActive]}>
                <Text style={[styles.tabText, currentPage === 'finance' && styles.tabTextActive]}>Finance</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Page content switch */}
          {currentPage === 'people' && (
            <ManageDriversTab 
              ref={driversTabRef}
              drivers={drivers}
              setDrivers={setDrivers}
              conductors={conductors}
              setConductors={setConductors}
            />
          )}

          {currentPage === 'buses' && (
            <ManageBusesTab 
              ref={busesTabRef}
              buses={buses}
              setBuses={setBuses}
              drivers={drivers}
              conductors={conductors}
            />
          )}

          {currentPage === 'finance' && (
            <FinanceTab buses={buses} />
          )}

          <TouchableOpacity style={styles.floatingHomeButton} onPress={onClose}>
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>

          {currentPage !== 'finance' && (
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleFloatingButtonPress}
            >
              <Text style={{ color: '#fff', fontSize: 28 }}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  appHeader: { backgroundColor: colors.primary, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoSRI: { fontSize: 28, color: colors.white, fontFamily: 'Montserrat-ExtraBold' },
  logoVibes: { fontSize: 28, color: colors.white, fontFamily: 'Montserrat-SemiBold' },
  headerSub: { color: colors.white, marginTop: 6, fontSize: 14, opacity: 0.95, fontWeight: '500' },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 6, borderRadius: 8, backgroundColor: 'transparent' },
  tabActive: { backgroundColor: '#E8F4FF' },
  tabText: { color: colors.textDark, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  floatingHomeButton: { position: 'absolute', right: 18, bottom: 100, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  floatingButton: { position: 'absolute', right: 18, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
