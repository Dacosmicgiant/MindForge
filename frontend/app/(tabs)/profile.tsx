import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import { Habit, HabitStats } from '../../types';
import apiService from '../../services/api';

export default function ProfileScreen() {
  const { user, logout, updateProfile, changePassword, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsResponse, statsResponse] = await Promise.all([
        apiService.getHabits(),
        apiService.getHabitStats(),
      ]);
      setHabits(habitsResponse.habits || []);
      setStats(statsResponse.stats || null);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ]
    );
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (newName.trim() === user?.name) {
      setShowNameModal(false);
      return;
    }

    try {
      await updateProfile({ name: newName.trim() });
      setShowNameModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );

  const ProfileRow = ({ 
    icon, 
    label, 
    value, 
    onPress, 
    showArrow = false,
    color = '#374151',
    disabled = false,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    color?: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.profileRow, disabled && styles.profileRowDisabled]} 
      onPress={onPress}
      disabled={!onPress || disabled}
    >
      <View style={styles.profileRowLeft}>
        <Ionicons name={icon as any} size={20} color={disabled ? '#9CA3AF' : color} />
        <Text style={[styles.profileRowLabel, { color: disabled ? '#9CA3AF' : color }]}>{label}</Text>
      </View>
      <View style={styles.profileRowRight}>
        {value && <Text style={styles.profileRowValue} numberOfLines={1}>{value}</Text>}
        {showArrow && <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading && !stats) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
        </View>

        {/* Stats Overview */}
        {stats && (
          <ProfileSection title="Overview">
            <View style={styles.statsOverview}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalActiveHabits}</Text>
                <Text style={styles.statLabel}>Active Habits</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.longestStreakOverall}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.todayCompletionRate}%</Text>
                <Text style={styles.statLabel}>Today's Rate</Text>
              </View>
            </View>
          </ProfileSection>
        )}

        {/* Account Settings */}
        <ProfileSection title="Account">
          <ProfileRow
            icon="person-outline"
            label="Edit Name"
            value={user?.name || 'Not set'}
            onPress={() => setShowNameModal(true)}
            showArrow
            disabled={authLoading}
          />
          <ProfileRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => setShowPasswordModal(true)}
            showArrow
            disabled={authLoading}
          />
          <ProfileRow
            icon="mail-outline"
            label="Email"
            value={user?.email || 'Not set'}
          />
          <ProfileRow
            icon="time-outline"
            label="Member Since"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          />
        </ProfileSection>

        {/* Habit Statistics */}
        {stats && (
          <ProfileSection title="Statistics">
            <ProfileRow
              icon="checkmark-circle-outline"
              label="Habits Completed Today"
              value={`${stats.habitsCompletedToday} / ${stats.totalActiveHabits}`}
            />
            <ProfileRow
              icon="trending-up-outline"
              label="Weekly Completion Rate"
              value={`${stats.weeklyCompletionRate}%`}
            />
            <ProfileRow
              icon="archive-outline"
              label="Archived Habits"
              value={stats.archivedHabits.toString()}
            />
            <ProfileRow
              icon="grid-outline"
              label="Categories Used"
              value={stats.categoriesUsed.toString()}
            />
          </ProfileSection>
        )}

        {/* App Info */}
        <ProfileSection title="About">
          <ProfileRow
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
          />
          <ProfileRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'Contact us at support@habittracker.com')}
            showArrow
          />
          <ProfileRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy would be shown here')}
            showArrow
          />
          <ProfileRow
            icon="refresh-outline"
            label="Refresh Data"
            onPress={loadData}
            showArrow
          />
        </ProfileSection>

        {/* Logout */}
        <ProfileSection title="">
          <ProfileRow
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
            showArrow
            color="#EF4444"
            disabled={authLoading}
          />
        </ProfileSection>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}

      {/* Edit Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowNameModal(false);
                  setNewName(user?.name || '');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateName}
                disabled={authLoading}
              >
                <Text style={styles.modalButtonTextSave}>
                  {authLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <TextInput
              style={styles.modalInput}
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
              placeholder="Current password"
              secureTextEntry
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
              placeholder="New password"
              secureTextEntry
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm new password"
              secureTextEntry
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleChangePassword}
                disabled={authLoading}
              >
                <Text style={styles.modalButtonTextSave}>
                  {authLoading ? 'Changing...' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileRowDisabled: {
    opacity: 0.5,
  },
  profileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileRowLabel: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  profileRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  profileRowValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonSave: {
    backgroundColor: '#6366F1',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  modalButtonTextSave: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});