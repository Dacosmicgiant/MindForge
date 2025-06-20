import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export default function ProfileScreen() {
  
  // Placeholder user data - replace with real API data
  const userData = {
    name: 'Demo User',
    email: 'demo@example.com',
    joinDate: '2024-01-15',
    totalHabits: 5,
    completedToday: 3,
    currentStreak: 7,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API
              await api.logout();
              // TODO: Clear stored auth token
              // Navigate back to welcome screen
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              // Even if API fails, still logout locally
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion',
              'Account deletion functionality will be implemented soon. Please contact support for assistance.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['left', 'right']}>
      <ScrollView style={{ flex: 1 }}>
        
        {/* Profile Header */}
        <View style={{
          backgroundColor: '#FFFFFF',
          padding: 20,
          alignItems: 'center',
          marginBottom: 16,
        }}>
          {/* Profile Avatar */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#3B82F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 32,
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}>
              {userData.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* User Info */}
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 4,
          }}>
            {userData.name}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            marginBottom: 16,
          }}>
            {userData.email}
          </Text>

          {/* Quick Stats */}
          <View style={{
            flexDirection: 'row',
            gap: 24,
          }}>
            <StatItem
              value={userData.totalHabits}
              label="Total Habits"
            />
            <StatItem
              value={userData.completedToday}
              label="Done Today"
            />
            <StatItem
              value={`${userData.currentStreak} days`}
              label="Current Streak"
            />
          </View>
        </View>

        {/* Account Settings */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 20,
          borderRadius: 12,
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <SectionHeader title="Account Settings" />
          
          <SettingsItem
            icon="👤"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />
          <SettingsItem
            icon="🔒"
            title="Change Password"
            subtitle="Update your account password"
            onPress={handleChangePassword}
            showBorder
          />
        </View>

        {/* App Settings */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 20,
          borderRadius: 12,
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <SectionHeader title="App Settings" />
          
          <SettingsItem
            icon="🔔"
            title="Notifications"
            subtitle="Manage your reminder preferences"
            onPress={() => Alert.alert('Settings', 'Notification settings coming soon!')}
          />
          <SettingsItem
            icon="🎨"
            title="Theme"
            subtitle="Choose your preferred appearance"
            onPress={() => Alert.alert('Settings', 'Theme settings coming soon!')}
          />
          <SettingsItem
            icon="🌍"
            title="Language"
            subtitle="Select your language"
            onPress={() => Alert.alert('Settings', 'Language settings coming soon!')}
            showBorder
          />
        </View>

        {/* Data & Privacy */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 20,
          borderRadius: 12,
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <SectionHeader title="Data & Privacy" />
          
          <SettingsItem
            icon="📊"
            title="Export Data"
            subtitle="Download your habit data"
            onPress={handleExportData}
          />
          <SettingsItem
            icon="📋"
            title="Privacy Policy"
            subtitle="Review our privacy practices"
            onPress={() => Alert.alert('Info', 'Privacy policy coming soon!')}
          />
          <SettingsItem
            icon="📄"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => Alert.alert('Info', 'Terms of service coming soon!')}
            showBorder
          />
        </View>

        {/* Support */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 20,
          borderRadius: 12,
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <SectionHeader title="Support" />
          
          <SettingsItem
            icon="❓"
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={() => Alert.alert('Help', 'Help center coming soon!')}
          />
          <SettingsItem
            icon="💬"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => Alert.alert('Support', 'Contact support coming soon!')}
          />
          <SettingsItem
            icon="⭐"
            title="Rate App"
            subtitle="Rate us on the app store"
            onPress={() => Alert.alert('Thanks!', 'App store rating coming soon!')}
            showBorder
          />
        </View>

        {/* Action Buttons */}
        <View style={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 12,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#EF4444',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={handleLogout}
          >
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#EF4444',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={handleDeleteAccount}
          >
            <Text style={{
              color: '#EF4444',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={{
          paddingBottom: 20,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
          }}>
            MindForge v1.0.0
          </Text>
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
            marginTop: 4,
          }}>
            Member since {new Date(userData.joinDate).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Item Component
function StatItem({ value, label }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#6B7280',
      }}>
        {label}
      </Text>
    </View>
  );
}

// Section Header Component
function SectionHeader({ title }) {
  return (
    <View style={{
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
      }}>
        {title}
      </Text>
    </View>
  );
}

// Settings Item Component
function SettingsItem({ icon, title, subtitle, onPress, showBorder = false }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: '#F3F4F6',
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{
        fontSize: 20,
        marginRight: 12,
      }}>
        {icon}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: '#111827',
          marginBottom: 2,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
        }}>
          {subtitle}
        </Text>
      </View>
      <Text style={{
        fontSize: 16,
        color: '#9CA3AF',
      }}>
        ›
      </Text>
    </TouchableOpacity>
  );
}