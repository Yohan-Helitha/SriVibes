import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import LoadingScreen from './src/screens/LoadingScreen';
import Onboarding01 from './src/screens/Onboarding01';
import Onboarding02 from './src/screens/Onboarding02';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Montserrat': require('./assets/fonts/Montserrat-Bold.ttf'),
          'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
          'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue even if fonts fail to load
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Or a simple loading indicator
  }

  if (showLoading) {
    return <LoadingScreen onFinish={() => setShowLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Onboarding01"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding01" component={Onboarding01Screen} />
        <Stack.Screen name="Onboarding02" component={Onboarding02Screen} />
        <Stack.Screen name="Login" component={LoginScreenWrapper} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Wrapper components to handle navigation
function Onboarding01Screen({ navigation }: any) {
  return <Onboarding01 onNext={() => navigation.navigate('Onboarding02')} />;
}

function Onboarding02Screen({ navigation }: any) {
  return <Onboarding02 onNext={() => navigation.navigate('Login')} />;
}

function LoginScreenWrapper({ navigation }: any) {
  return <LoginScreen onLogin={() => navigation.navigate('Home')} />;
}
