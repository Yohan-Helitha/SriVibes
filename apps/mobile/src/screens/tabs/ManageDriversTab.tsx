import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type Person = { id: string; nic?: string; name: string; phone?: string; age?: string };

type Props = {
  drivers: Person[];
  setDrivers: React.Dispatch<React.SetStateAction<Person[]>>;
  conductors: Person[];
  setConductors: React.Dispatch<React.SetStateAction<Person[]>>;
};

export type ManageDriversTabRef = {
  openAddForm: () => void;
};

const ManageDriversTab = forwardRef<ManageDriversTabRef, Props>(({ drivers, setDrivers, conductors, setConductors }, ref) => {
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personRole, setPersonRole] = useState<'driver' | 'conductor'>('driver');
  const [personNic, setPersonNic] = useState('');
  const [personAge, setPersonAge] = useState('');
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  const addPerson = () => {
    if (!personName.trim()) return;
    if (editingPersonId) {
      const updated: Person = { 
        id: editingPersonId, 
        nic: personNic.trim(), 
        name: personName.trim(), 
        phone: personPhone.trim(), 
        age: personAge.trim() 
      };
      if (personRole === 'driver') {
        setDrivers((s) => s.map((p) => (p.id === editingPersonId ? updated : p)));
      } else {
        setConductors((s) => s.map((p) => (p.id === editingPersonId ? updated : p)));
      }
      setEditingPersonId(null);
    } else {
      const newPerson: Person = { 
        id: `${Date.now()}`, 
        nic: personNic.trim(), 
        name: personName.trim(), 
        phone: personPhone.trim(), 
        age: personAge.trim() 
      };
      if (personRole === 'driver') {
        setDrivers((s) => [newPerson, ...s]);
      } else {
        setConductors((s) => [newPerson, ...s]);
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setPersonName('');
    setPersonPhone('');
    setPersonNic('');
    setPersonAge('');
    setShowPersonForm(false);
  };

  const editPerson = (person: Person, role: 'driver' | 'conductor') => {
    setEditingPersonId(person.id);
    setPersonNic(person.nic || '');
    setPersonName(person.name);
    setPersonPhone(person.phone || '');
    setPersonAge(person.age || '');
    setPersonRole(role);
    setShowPersonForm(true);
  };

  const deletePerson = (id: string, role: 'driver' | 'conductor') => {
    if (role === 'driver') {
      setDrivers((s) => s.filter(x => x.id !== id));
    } else {
      setConductors((s) => s.filter(x => x.id !== id));
    }
  };

  useImperativeHandle(ref, () => ({
    openAddForm: () => {
      setEditingPersonId(null);
      setPersonName('');
      setPersonPhone('');
      setPersonNic('');
      setPersonAge('');
      setShowPersonForm(true);
    },
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.sectionRow, { marginHorizontal: 12 }]}>
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Drivers</Text>
          <Text style={styles.cardSub}>{drivers.length} registered</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Conductors</Text>
          <Text style={styles.cardSub}>{conductors.length} registered</Text>
        </View>
      </View>

      {/* Lists: drivers & conductors with edit/delete */}
      <View style={{ flexDirection: 'row', marginTop: 12, marginHorizontal: 12 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.sectionHeading}>Drivers</Text>
          {drivers.map((d) => (
            <View key={d.id} style={styles.listRow}>
              <Text>{d.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={() => editPerson(d, 'driver')} 
                  style={{ marginRight: 8 }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePerson(d.id, 'driver')}>
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
                <TouchableOpacity 
                  onPress={() => editPerson(c, 'conductor')} 
                  style={{ marginRight: 8 }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePerson(c.id, 'conductor')}>
                  <Ionicons name="trash-outline" size={18} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {showPersonForm && (
        <View style={[styles.card, { marginHorizontal: 12, marginTop: 12, marginBottom: 180 }]}>
          <Text style={styles.sectionHeading}>
            {editingPersonId ? 'Edit Person' : 'Register Driver / Conductor'}
          </Text>
          <TextInput 
            style={styles.input} 
            placeholder="NIC" 
            value={personNic} 
            onChangeText={setPersonNic} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Name" 
            value={personName} 
            onChangeText={setPersonName} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Phone" 
            value={personPhone} 
            onChangeText={setPersonPhone} 
            keyboardType="phone-pad" 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Age" 
            value={personAge} 
            onChangeText={setPersonAge} 
            keyboardType="number-pad" 
          />
          <View style={{ flexDirection: 'row', marginVertical: 8 }}>
            <TouchableOpacity 
              onPress={() => setPersonRole('driver')} 
              style={[styles.smallBtn, personRole === 'driver' && styles.smallBtnActive]}
            >
              <Text style={[styles.smallBtnText, personRole === 'driver' && { color: '#fff' }]}>
                Driver
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setPersonRole('conductor')} 
              style={[styles.smallBtn, personRole === 'conductor' && styles.smallBtnActive, { marginLeft: 8 }]}
            >
              <Text style={[styles.smallBtnText, personRole === 'conductor' && { color: '#fff' }]}>
                Conductor
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity 
              style={[styles.secondaryButton]} 
              onPress={() => { 
                setShowPersonForm(false); 
                setEditingPersonId(null); 
              }}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={addPerson}>
              <Text style={styles.primaryButtonText}>{editingPersonId ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionCard: { backgroundColor: colors.white, padding: 12, borderRadius: 8, flex: 1, marginRight: 8 },
  cardTitle: { fontWeight: '700', color: colors.textDark },
  cardSub: { color: '#666', marginTop: 6 },
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
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
});

export default ManageDriversTab;
