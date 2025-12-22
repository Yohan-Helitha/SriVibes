import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>SRiVibes</Text>
        </View>

        {/* Login Form Placeholder */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          
          <View style={styles.inputPlaceholder}>
            <Text style={styles.inputLabel}>Email or Phone</Text>
          </View>

          <View style={styles.inputPlaceholder}>
            <Text style={styles.inputLabel}>Password</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputLabel: {
    color: colors.text,
    fontSize: 16,
    opacity: 0.8,
  },
  button: {
    backgroundColor: colors.text,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
});
