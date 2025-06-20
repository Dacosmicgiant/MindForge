// app/(tabs)/_layout.js - Main App Tabs Layout (Compatible with Expo Router v5)
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="home" color={color} size={size} />
            ),
            headerTitle: 'My Habits',
          }}
        />
        <Tabs.Screen
          name="create-habit"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="plus" color={color} size={size} />
            ),
            headerTitle: 'Create New Habit',
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="chart" color={color} size={size} />
            ),
            headerTitle: 'Progress & Stats',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="user" color={color} size={size} />
            ),
            headerTitle: 'Profile',
          }}
        />
      </Tabs>
    </>
  );
}

// Simple tab bar icon component (you can replace with @expo/vector-icons)
function TabBarIcon({ name, color, size = 24 }) {
  const icons = {
    home: '🏠',
    plus: '➕',
    chart: '📊', 
    user: '👤',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '❓'}
    </Text>
  );
}
