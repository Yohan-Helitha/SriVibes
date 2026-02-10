import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  onSuccess: (payload: { ownerId: string; ownerType: string }) => void;
  onCancel: () => void;
};

export default function OwnerLoginScreen({ onSuccess, onCancel }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Placeholder: in real app call backend endpoint /auth/owner/login
    // For now simulate success and return a BUS_OWNER
    onSuccess({ ownerId: 'owner-123', ownerType: 'BUS_OWNER' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Owner Login</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email or phone"
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.lightGray, justifyContent: 'center' },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: colors.textDark, textAlign: 'center' },
  input: { backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  loginButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  loginText: { color: colors.white, fontWeight: '600' },
  cancelButton: { marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#666' },
});
