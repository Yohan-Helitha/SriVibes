import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding01 from './src/screens/Onboarding01';
import Onboarding02 from './src/screens/Onboarding02';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {
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
        <Stack.Screen name="Login" component={LoginScreen} />
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
