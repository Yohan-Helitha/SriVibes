import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
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

  return (
    <LinearGradient
      colors={[colors.primary, colors.primary]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!showSecondScreen ? (
          // First Screen: "SRIVibes" without red dot
          <View style={styles.textContainer}>
            <View style={styles.brandContainer}>
              <Text style={styles.brand}>SRIVibes</Text>
            </View>
          </View>
        ) : (
          // Second Screen: "Ayubowan! SRIVibes." with pulsing dot
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Ayubowan!</Text>
            <View style={styles.brandContainer}>
              <Text style={styles.brand}>SRIVibes</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
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
