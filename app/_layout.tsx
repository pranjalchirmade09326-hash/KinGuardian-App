import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '../src/store/AppProvider';
import { AuthProvider } from '../src/store/AuthProvider';
import { ThemeProvider } from '../src/store/ThemeProvider';

export const unstable_settings = {
  initialRouteName: '(auth)'
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
