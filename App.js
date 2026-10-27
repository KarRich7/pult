import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TVProvider } from './src/context/TVContext';
import { RemoteScreen } from './src/screens/RemoteScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TVProvider>
        <StatusBar style="light" />
        <RemoteScreen />
      </TVProvider>
    </SafeAreaProvider>
  );
}
