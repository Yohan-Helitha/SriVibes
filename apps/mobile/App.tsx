import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Onboarding01 from './src/screens/Onboarding01';
import Onboarding02 from './src/screens/Onboarding02';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    setCurrentScreen(prev => prev + 1);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return <Onboarding01 onNext={handleNext} />;
      case 1:
        return <Onboarding02 onNext={handleNext} />;
      case 2:
        return <LoginScreen onLogin={() => console.log('Login')} />;
      default:
        return <Onboarding01 onNext={handleNext} />;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
    </>
  );
}
