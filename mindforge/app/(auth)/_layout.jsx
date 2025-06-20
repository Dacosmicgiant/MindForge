import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
          },
          headerTintColor: '#3B82F6',
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
          // Ensure headers respect safe area
          headerStatusBarHeight: 0,
        }}
      >
        <Stack.Screen
          name="signup"
          options={{
            title: 'Create Account',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'Sign In',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}