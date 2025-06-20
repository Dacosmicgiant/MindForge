import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
          animation: 'slide_from_right',
          // Ensure headers respect safe area
          headerStatusBarHeight: 0,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'MindForge',
            headerShown: false, // Hide header for welcome screen
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false, // Auth group handles its own headers
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false, // Tabs group handles its own headers
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Page Not Found',
            headerShown: true,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}