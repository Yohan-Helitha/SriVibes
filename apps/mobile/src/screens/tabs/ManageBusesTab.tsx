import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { colors } from '../../theme/colors';

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

type Props = {
  buses: Bus[];
  setBuses: React.Dispatch<React.SetStateAction<Bus[]>>;
  drivers: Person[];
  conductors: Person[];
};

export type ManageBusesTabRef = {
  openAddForm: () => void;
};

const ManageBusesTab = forwardRef<ManageBusesTabRef, Props>(({ buses, setBuses, drivers, conductors }, ref) => {
  const [showAddBus, setShowAddBus] = useState(false);
  const [expressName, setExpressName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [seats, setSeats] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [passingCities, setPassingCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [turns, setTurns] = useState<Array<{ start: string; end: string; conductorId?: string; driverId?: string }>>([]);
  const [turnsCount, setTurnsCount] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');

  const addPassingCity = () => {
    const c = cityInput.trim();
    if (!c) return;
    setPassingCities((s) => [...s, c]);
    setCityInput('');
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
      startPoint: startPoint.trim(),
      endPoint: endPoint.trim(),
      turns,
    };
    setBuses((s) => [newBus, ...s]);
    resetForm();
  };

  const resetForm = () => {
    setExpressName('');
    setBusNumber('');
    setSeats('');
    setRouteNumber('');
    setPassingCities([]);
    setTurns([]);
    setStartPoint('');
    setEndPoint('');
    setTurnsCount('');
    setShowAddBus(false);
  };

  useImperativeHandle(ref, () => ({
    openAddForm: () => {
      setShowAddBus(true);
    },
  }));

  return (
    <View style={styles.container}>
      {showAddBus && (
        <View style={[styles.card, { marginHorizontal: 12, marginTop: 12, marginBottom: 180 }]}>
          <TextInput 
            style={styles.input} 
            placeholder="Express name" 
            value={expressName} 
            onChangeText={setExpressName} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Bus number" 
            value={busNumber} 
            onChangeText={setBusNumber} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Seats" 
            value={seats} 
            onChangeText={setSeats} 
            keyboardType="number-pad" 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Route number" 
            value={routeNumber} 
            onChangeText={setRouteNumber} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Start point" 
            value={startPoint} 
            onChangeText={setStartPoint} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="End point" 
            value={endPoint} 
            onChangeText={setEndPoint} 
          />

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Passing cities</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                placeholder="Add city" 
                value={cityInput} 
                onChangeText={setCityInput} 
              />
              <TouchableOpacity 
                style={[styles.smallBtn, { marginLeft: 8 }]} 
                onPress={addPassingCity}
              >
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
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                placeholder="Number of turns" 
                value={turnsCount} 
                onChangeText={applyTurnsCount} 
                keyboardType="number-pad" 
              />
            </View>
            <View style={{ marginTop: 8 }}>
              {turns.map((t, i) => (
                <View key={i} style={{ marginBottom: 8, paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput 
                      style={[styles.input, { flex: 1 }]} 
                      placeholder="Start time (e.g. 08:00)" 
                      value={t.start} 
                      onChangeText={(v) => updateTurn(i, { start: v })} 
                    />
                    <TextInput 
                      style={[styles.input, { flex: 1, marginLeft: 8 }]} 
                      placeholder="End time (e.g. 12:00)" 
                      value={t.end} 
                      onChangeText={(v) => updateTurn(i, { end: v })} 
                    />
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <TouchableOpacity 
                      style={[styles.smallBtn, { marginRight: 8 }]} 
                      onPress={() => selectDriver(i)}
                    >
                      <Text style={styles.smallBtnText}>
                        {drivers.find(d => d.id === t.driverId)?.name ?? 'Assign Driver'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.smallBtn} 
                      onPress={() => selectConductor(i)}
                    >
                      <Text style={styles.smallBtnText}>
                        {conductors.find(c => c.id === t.conductorId)?.name ?? 'Assign Conductor'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity 
              style={[styles.secondaryButton]} 
              onPress={resetForm}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={addBus}>
              <Text style={styles.primaryButtonText}>Save Bus</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ marginTop: 12, flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.sectionHeading}>Your Buses</Text>
        {buses.length === 0 ? (
          <Text style={{ color: '#666' }}>No buses yet</Text>
        ) : (
          buses.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.expressName} — {item.busNumber}</Text>
              <Text style={styles.cardSub}>Seats: {item.seats} | Route: {item.routeNumber}</Text>
              <Text style={styles.cardSub}>From: {item.startPoint} → {item.endPoint}</Text>
              <Text style={styles.cardSub}>Cities: {item.passingCities.join(', ')}</Text>
              <Text style={styles.cardSub}>
                Turns: {item.turns.map((t) => `${t.start}-${t.end}`).join(', ')}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE', padding: 8, borderRadius: 6, marginBottom: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.primary },
  smallBtnText: { color: colors.primary },
  primaryButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: colors.white, fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderColor: '#CCC', padding: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#333' },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.textDark },
  card: { backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontWeight: '700', color: colors.textDark },
  cardSub: { color: '#666', marginTop: 6 },
  tag: { backgroundColor: '#EEF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, marginRight: 8, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: colors.textDark },
});

export default ManageBusesTab;
