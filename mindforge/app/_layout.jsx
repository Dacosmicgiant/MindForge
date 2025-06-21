import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { notificationService } from '../services/notifications';

export default function RootLayout() {
  // Initialize notifications when app starts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing MindForge app...');
        
        // Initialize notification service
        const notificationSuccess = await notificationService.initialize();
        
        if (notificationSuccess) {
          console.log('✅ Notifications initialized successfully');
        } else {
          console.log('⚠️ Notifications not available or permission denied');
        }
        
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

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