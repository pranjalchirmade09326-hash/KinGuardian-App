import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'landing'
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="features" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="security" />
      <Stack.Screen name="about" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="location" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
