import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-ExtraBold': require('../../assets/fonts/Montserrat-ExtraBold.ttf'),
    'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
  });

  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Show first screen for 2 seconds
    const firstScreenTimer = setTimeout(() => {
      // Fade out first screen and fade in second screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSecondScreen(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        // Start red dot pulsing animation
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(dotScale, {
                toValue: 1.3,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(dotOpacity, {
                toValue: 0.6,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(dotScale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(dotOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      });
    }, 2000);

    // Finish loading after total 4 seconds (2s first screen + 2s second screen)
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => {
      clearTimeout(firstScreenTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (!fontsLoaded) {
    return null; // or a simple loading indicator
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.primary]}
      style={styles.container}
    >
      {/* @ts-ignore */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!showSecondScreen ? (
          // First Screen: "SRIVibes" without red dot
          <View style={styles.textContainer}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandSRI}>SRI</Text>
              <Text style={styles.brandVibes}>Vibes</Text>
            </View>
          </View>
        ) : (
          // Second Screen: "Ayubowan! SRIVibes." with pulsing dot
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Ayubowan!</Text>
            <View style={styles.brandContainer}>
              <Text style={styles.brandSRI}>SRI</Text>
              <Text style={styles.brandVibes}>Vibes</Text>
              {/* @ts-ignore */}
              <Animated.View
                style={[
                  styles.animatedDot,
                  {
                    transform: [{ scale: dotScale }],
                    opacity: dotOpacity,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
    fontFamily: 'Montserrat-Bold',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandSRI: {
    fontSize: 48,
    color: colors.white,
    letterSpacing: 1,
    fontFamily: 'Montserrat-ExtraBold',
  },
  brandVibes: {
    fontSize: 48,
    color: colors.white,
    letterSpacing: 1,
    fontFamily: 'Montserrat-SemiBold',
  },
  staticDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
    marginLeft: 4,
    marginBottom: -20,
  },
  animatedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
    marginLeft: 4,
    marginBottom: -20,
  },
});
