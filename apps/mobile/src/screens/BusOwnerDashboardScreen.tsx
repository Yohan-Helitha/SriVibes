import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = { onClose: () => void; ownerType?: string };

type Person = { id: string; name: string; phone?: string };
type Bus = {
  id: string;
  expressName: string;
  busNumber: string;
  seats: number;
  routeNumber: string;
  passingCities: string[];
  turns: Array<{ start: string; end: string; conductorId?: string; driverId?: string }>;
};

export default function BusOwnerDashboardScreen({ onClose }: Props) {
  const [drivers, setDrivers] = useState<Person[]>([]);
  const [conductors, setConductors] = useState<Person[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  // Driver/Conductor form state
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personRole, setPersonRole] = useState<'driver' | 'conductor'>('driver');

  // Add Bus form state
  const [showAddBus, setShowAddBus] = useState(false);
  const [expressName, setExpressName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [seats, setSeats] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [passingCities, setPassingCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [turns, setTurns] = useState<Array<{ start: string; end: string; conductorId?: string; driverId?: string }>>([]);
  const [turnStart, setTurnStart] = useState('');
  const [turnEnd, setTurnEnd] = useState('');
  const [turnsCount, setTurnsCount] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);

  const addPerson = () => {
    if (!personName.trim()) return;
    const newPerson: Person = { id: `${Date.now()}`, name: personName.trim(), phone: personPhone.trim() };
    if (personRole === 'driver') setDrivers((s) => [newPerson, ...s]);
    else setConductors((s) => [newPerson, ...s]);
    setPersonName('');
    setPersonPhone('');
  };

  const addPassingCity = () => {
    const c = cityInput.trim();
    if (!c) return;
    setPassingCities((s) => [...s, c]);
    setCityInput('');
  };

  const addTurn = (start?: string, end?: string) => {
    const s = start ?? turnStart;
    const e = end ?? turnEnd;
    if (!s || !e) return;
    setTurns((cur) => [...cur, { start: s, end: e }]);
    setTurnStart('');
    setTurnEnd('');
  };

  const updateTurn = (idx: number, changes: Partial<{ start: string; end: string; conductorId?: string; driverId?: string }>) => {
    setTurns((cur) => cur.map((t, i) => (i === idx ? { ...t, ...changes } : t)));
  };

  const selectDriver = (idx: number) => {
    if (!drivers.length) {
      Alert.alert('No drivers', 'Please add drivers first');
      return;
    }
    Alert.alert('Assign driver', undefined, [
      ...drivers.map((d) => ({ text: d.name, onPress: () => updateTurn(idx, { driverId: d.id }) })),
      { text: 'Cancel', style: 'cancel' },
    ] as any);
  };

  const selectConductor = (idx: number) => {
    if (!conductors.length) {
      Alert.alert('No conductors', 'Please add conductors first');
      return;
    }
    Alert.alert('Assign conductor', undefined, [
      ...conductors.map((c) => ({ text: c.name, onPress: () => updateTurn(idx, { conductorId: c.id }) })),
      { text: 'Cancel', style: 'cancel' },
    ] as any);
  };

  // When turnsCount changes, create empty turn slots
  const applyTurnsCount = (countStr: string) => {
    setTurnsCount(countStr);
    const n = Number(countStr) || 0;
    if (n <= 0) return;
    const newTurns = Array.from({ length: n }, (_, i) => turns[i] ?? { start: '', end: '' });
    setTurns(newTurns);
  };

  const addBus = () => {
    if (!expressName || !busNumber) return;
    const newBus: Bus = {
      id: `${Date.now()}`,
      expressName,
      busNumber,
      seats: Number(seats) || 0,
      routeNumber,
      passingCities,
      turns,
    };
    setBuses((s) => [newBus, ...s]);
    // reset form
    setExpressName('');
    setBusNumber('');
    setSeats('');
    setRouteNumber('');
    setPassingCities([]);
    setTurns([]);
    setShowAddBus(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <Text style={styles.heading}>Bus Owner Dashboard</Text>

      <View style={styles.sectionRow}>
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Drivers</Text>
          <Text style={styles.cardSub}>{drivers.length} registered</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Conductors</Text>
          <Text style={styles.cardSub}>{conductors.length} registered</Text>
        </View>
      </View>

      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Name" value={personName} onChangeText={setPersonName} />
        <TextInput style={styles.input} placeholder="Phone" value={personPhone} onChangeText={setPersonPhone} keyboardType="phone-pad" />
        <View style={{ flexDirection: 'row', marginVertical: 8 }}>
          <TouchableOpacity onPress={() => setPersonRole('driver')} style={[styles.smallBtn, personRole === 'driver' && styles.smallBtnActive]}>
            <Text style={[styles.smallBtnText, personRole === 'driver' && { color: '#fff' }]}>Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPersonRole('conductor')} style={[styles.smallBtn, personRole === 'conductor' && styles.smallBtnActive, { marginLeft: 8 }]}>
            <Text style={[styles.smallBtnText, personRole === 'conductor' && { color: '#fff' }]}>Conductor</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={addPerson}>
          <Text style={styles.primaryButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

        {/* Lists: drivers & conductors with edit/delete */}
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.sectionHeading}>Drivers</Text>
            {drivers.map((d) => (
              <View key={d.id} style={styles.listRow}>
                <Text>{d.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => { setEditingPersonId(d.id); setPersonName(d.name); setPersonPhone(d.phone || ''); setPersonRole('driver'); }} style={{ marginRight: 8 }}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDrivers((s) => s.filter(x => x.id !== d.id))}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionHeading}>Conductors</Text>
            {conductors.map((c) => (
              <View key={c.id} style={styles.listRow}>
                <Text>{c.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => { setEditingPersonId(c.id); setPersonName(c.name); setPersonPhone(c.phone || ''); setPersonRole('conductor'); }} style={{ marginRight: 8 }}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConductors((s) => s.filter(x => x.id !== c.id))}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.sectionHeading}>Add / Manage Buses</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAddBus(true)}>
          <Text style={styles.primaryButtonText}>Add Bus</Text>
        </TouchableOpacity>
      </View>

      {showAddBus && (
        <View style={styles.card}>
          <TextInput style={styles.input} placeholder="Express name" value={expressName} onChangeText={setExpressName} />
          <TextInput style={styles.input} placeholder="Bus number" value={busNumber} onChangeText={setBusNumber} />
          <TextInput style={styles.input} placeholder="Seats" value={seats} onChangeText={setSeats} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="Route number" value={routeNumber} onChangeText={setRouteNumber} />

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Passing cities</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Add city" value={cityInput} onChangeText={setCityInput} />
              <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={addPassingCity}>
                <Text style={styles.smallBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {passingCities.map((c, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text>{c}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Turns per day</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Number of turns" value={turnsCount} onChangeText={applyTurnsCount} keyboardType="number-pad" />
            </View>
            <View style={{ marginTop: 8 }}>
              {turns.map((t, i) => (
                <View key={i} style={{ marginBottom: 8, paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Start time (e.g. 08:00)" value={t.start} onChangeText={(v) => updateTurn(i, { start: v })} />
                    <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="End time (e.g. 12:00)" value={t.end} onChangeText={(v) => updateTurn(i, { end: v })} />
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <TouchableOpacity style={[styles.smallBtn, { marginRight: 8 }]} onPress={() => selectDriver(i)}>
                      <Text style={styles.smallBtnText}>{drivers.find(d => d.id === t.driverId)?.name ?? 'Assign Driver'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => selectConductor(i)}>
                      <Text style={styles.smallBtnText}>{conductors.find(c => c.id === t.conductorId)?.name ?? 'Assign Conductor'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity style={[styles.secondaryButton]} onPress={() => setShowAddBus(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={addBus}>
              <Text style={styles.primaryButtonText}>Save Bus</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ marginTop: 12, flex: 1 }}>
        <Text style={styles.sectionHeading}>Your Buses</Text>
        {buses.length === 0 ? (
          <Text style={{ color: '#666' }}>No buses yet</Text>
        ) : (
          buses.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.expressName} — {item.busNumber}</Text>
              <Text style={styles.cardSub}>Seats: {item.seats} | Route: {item.routeNumber}</Text>
              <Text style={styles.cardSub}>Cities: {item.passingCities.join(', ')}</Text>
              <Text style={styles.cardSub}>Turns: {item.turns.map((t) => `${t.start}-${t.end}`).join(', ')}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: colors.lightGray },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: colors.textDark },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionCard: { backgroundColor: colors.white, padding: 12, borderRadius: 8, flex: 1, marginRight: 8 },
  cardTitle: { fontWeight: '700', color: colors.textDark },
  cardSub: { color: '#666', marginTop: 6 },
  formRow: { marginTop: 12, backgroundColor: colors.white, padding: 12, borderRadius: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE', padding: 8, borderRadius: 6, marginBottom: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.primary },
  smallBtnActive: { backgroundColor: colors.primary },
  smallBtnText: { color: colors.primary },
  primaryButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: colors.white, fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderColor: '#CCC', padding: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#333' },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.textDark },
  card: { backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 },
  tag: { backgroundColor: '#EEF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, marginRight: 8, marginBottom: 6 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: colors.textDark },
  closeButton: { marginTop: 12, alignItems: 'center' },
  closeText: { color: colors.primary, fontWeight: '600' },
});
