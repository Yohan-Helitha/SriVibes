import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function Onboarding02({ onNext }: { onNext: () => void }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-ExtraBold': require('../../assets/fonts/Montserrat-ExtraBold.ttf'),
    'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <LinearGradient
      colors={[colors.primary, colors.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Brand Area */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Ayubowan!</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.illustrationPlaceholder}>
            {/* Placeholder for illustration - add your bus/location icon here */}
            <View style={styles.circle}>
              <Text style={styles.iconText}>🚌</Text>
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Track Your Bus in Real-Time</Text>
            <Text style={styles.subtitle}>
              Never miss your bus again! Get live location updates and accurate arrival times
            </Text>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext}>
            <Text style={styles.skipText}>Skip</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    color: colors.text,
    letterSpacing: 2,
    fontFamily: 'Montserrat-Bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationPlaceholder: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: 'Montserrat-SemiBold',
  },
  bottomContainer: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.text,
  },
  button: {
    backgroundColor: colors.text,
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 30,
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
    fontFamily: 'Montserrat-SemiBold',
  },
  skipText: {
    color: colors.text,
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'Montserrat-SemiBold',
  },
});
