import { Tabs } from 'expo-router';
import { Platform, StatusBar } from 'react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  // Base height for tab bar content (without safe area)
  const baseHeight = Platform.select({
    ios: 60,
    android: 70,
    default: 70,
  });
  
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F9FAFB" 
        translucent={false}
      />
      <Tabs 
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            elevation: 8,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
            shadowColor: '#000',
            // Total height = base content + safe area for navigation buttons
            height: baseHeight + insets.bottom,
            // Push content up by safe area amount to avoid navigation overlap
            paddingBottom: Math.max(insets.bottom, 8), 
            paddingTop: 8,
            paddingHorizontal: 4,
            // Ensure proper positioning
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginBottom: Platform.OS === 'android' ? 4 : 0,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'android' ? 4 : 0,
          },
          // Ensure tab bar doesn't overlap content and hides on keyboard
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen 
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ 
                fontSize: 24, 
                color: color,
                opacity: focused ? 1 : 0.7 
              }}>
                🏠
              </Text>
            ),
            tabBarLabel: 'Today',
            title: 'Today',
          }}
        />
        
        <Tabs.Screen 
          name="create"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ 
                fontSize: 24, 
                color: color,
                opacity: focused ? 1 : 0.7 
              }}>
                ➕
              </Text>
            ),
            tabBarLabel: 'Create',
            title: 'Create',
          }}
        />
        
        <Tabs.Screen 
          name="progress"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ 
                fontSize: 24, 
                color: color,
                opacity: focused ? 1 : 0.7 
              }}>
                📊
              </Text>
            ),
            tabBarLabel: 'Progress',
            title: 'Progress',
          }}
        />
        
        <Tabs.Screen 
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ 
                fontSize: 24, 
                color: color,
                opacity: focused ? 1 : 0.7 
              }}>
                👤
              </Text>
            ),
            tabBarLabel: 'Profile',
            title: 'Profile',
          }}
        />        
      </Tabs>
    </>
  );
}