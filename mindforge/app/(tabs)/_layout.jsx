import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

// Tab Bar Icon Component
function TabBarIcon({ name, color, size = 24 }) {
  const icons = {
    home: '🏠',
    plus: '➕',
    chart: '📊',
    user: '👤',
  };
  
  return (
    <Text style={{ 
      fontSize: size, 
      color: color === '#3B82F6' ? color : '#6B7280' 
    }}>
      {icons[name] || '📱'}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            color: '#111827',
          },
          headerTintColor: '#3B82F6',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="home" color={color} size={size} />
            ),
            headerTitle: 'My Habits',
          }}
        />
        <Tabs.Screen
          name="create"
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