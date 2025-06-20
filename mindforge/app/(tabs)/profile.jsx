import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  RefreshControl
} from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { api, tokenManager } from '../../services/api';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Edit form states
  const [editForm, setEditForm] = useState({ name: '', profilePicture: '' });
  const [editLoading, setEditLoading] = useState(false);
  
  // Settings states
  const [settings, setSettings] = useState({
    notifications: true,
    weeklyReport: true,
    streakReminders: true,
    motivationalQuotes: false
  });

  // Fetch all profile data
  const fetchProfileData = useCallback(async () => {
    try {
      console.log('🔄 Fetching profile data...');
      
      const [profileResponse, habitsResponse, statsResponse] = await Promise.all([
        api.getProfile(),
        api.getHabits(),
        api.getHabitStats()
      ]);

      if (profileResponse.success) {
        const user = profileResponse.data.user;
        setUserData(user);
        setEditForm({
          name: user.name || '',
          profilePicture: user.profilePicture || ''
        });
        console.log('✅ Profile loaded');
      } else {
        console.error('❌ Failed to fetch profile:', profileResponse.error);
        setUserData({
          name: 'User',
          email: 'user@example.com',
          createdAt: new Date().toISOString()
        });
      }

      if (habitsResponse.success) {
        setHabits(habitsResponse.data.habits || []);
        console.log('✅ Habits loaded for management');
      }

      if (statsResponse.success) {
        setStats(statsResponse.data.stats || {});
        console.log('✅ Stats loaded');
      }

    } catch (error) {
      console.error('❌ Error fetching profile data:', error);
      setUserData({
        name: 'User',
        email: 'user@example.com',
        createdAt: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await fetchProfileData();
      setLoading(false);
    };
    loadProfile();
  }, [fetchProfileData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  }, [fetchProfileData]);

  // Update profile
  const handleUpdateProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setEditLoading(true);
    try {
      const response = await api.updateProfile({
        name: editForm.name.trim(),
        profilePicture: editForm.profilePicture
      });

      if (response.success) {
        setUserData(response.data.user);
        setShowEditProfile(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      Alert.alert('Error', 'Unable to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Archive/Unarchive habit
  const handleArchiveHabit = async (habitId, isArchived) => {
    try {
      const response = await api.archiveHabit(habitId, !isArchived);
      
      if (response.success) {
        // Update local state
        setHabits(prev => prev.map(habit => 
          habit._id === habitId 
            ? { ...habit, isArchived: !isArchived }
            : habit
        ));
        
        Alert.alert(
          'Success', 
          `Habit ${!isArchived ? 'archived' : 'unarchived'} successfully`
        );
        
        // Refresh stats
        const statsResponse = await api.getHabitStats();
        if (statsResponse.success) {
          setStats(statsResponse.data.stats || {});
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to update habit');
      }
    } catch (error) {
      console.error('❌ Archive habit error:', error);
      Alert.alert('Error', 'Unable to update habit. Please try again.');
    }
  };

  // Delete habit
  const handleDeleteHabit = (habitId, habitName) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to permanently delete "${habitName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteHabit(habitId);
              
              if (response.success) {
                setHabits(prev => prev.filter(habit => habit._id !== habitId));
                Alert.alert('Success', 'Habit deleted successfully');
                
                // Refresh stats
                const statsResponse = await api.getHabitStats();
                if (statsResponse.success) {
                  setStats(statsResponse.data.stats || {});
                }
              } else {
                Alert.alert('Error', response.error || 'Failed to delete habit');
              }
            } catch (error) {
              console.error('❌ Delete habit error:', error);
              Alert.alert('Error', 'Unable to delete habit. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Generate achievements based on user data
  const getAchievements = () => {
    const achievements = [];
    
    if (stats.totalActiveHabits >= 1) {
      achievements.push({
        id: 'first_habit',
        title: 'Getting Started',
        description: 'Created your first habit',
        icon: '🌱',
        unlocked: true,
        date: userData?.createdAt
      });
    }
    
    if (stats.totalActiveHabits >= 5) {
      achievements.push({
        id: 'habit_collector',
        title: 'Habit Collector',
        description: 'Created 5 or more habits',
        icon: '📚',
        unlocked: true
      });
    }
    
    if (stats.longestStreakOverall >= 7) {
      achievements.push({
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        unlocked: true
      });
    }
    
    if (stats.longestStreakOverall >= 30) {
      achievements.push({
        id: 'month_master',
        title: 'Month Master',
        description: 'Maintained a 30-day streak',
        icon: '👑',
        unlocked: true
      });
    }
    
    if (stats.weeklyCompletionRate >= 80) {
      achievements.push({
        id: 'consistency_king',
        title: 'Consistency Champion',
        description: 'Achieved 80%+ weekly completion',
        icon: '⭐',
        unlocked: true
      });
    }
    
    // Locked achievements
    if (stats.totalActiveHabits < 10) {
      achievements.push({
        id: 'habit_master',
        title: 'Habit Master',
        description: 'Create 10 habits',
        icon: '🏆',
        unlocked: false,
        progress: `${stats.totalActiveHabits || 0}/10`
      });
    }
    
    if (stats.longestStreakOverall < 100) {
      achievements.push({
        id: 'century_club',
        title: 'Century Club',
        description: 'Achieve a 100-day streak',
        icon: '💯',
        unlocked: false,
        progress: `${stats.longestStreakOverall || 0}/100 days`
      });
    }
    
    return achievements;
  };

  // Export user data
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will export all your habit data to a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert(
              'Export Initiated',
              'Data export functionality will be available in the next update. For now, your data is safely stored in your account.'
            );
          }
        }
      ]
    );
  };

  // Clear all data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL your habits and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will delete everything.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete All',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Data Clearing',
                      'Bulk data deletion will be available in the next update. For now, you can delete habits individually.'
                    );
                  }
                }
              ]
            );
          }
        }
      ]
    );
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
              console.log('🔄 Logging out...');
              await api.logout();
              console.log('✅ Logout successful');
              router.replace('/');
            } catch (error) {
              console.error('❌ Logout error:', error);
              await tokenManager.removeToken();
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const memberDays = userData?.createdAt ? 
    Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account and preferences
          </Text>
        </View>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>

          <Text style={styles.userName}>
            {userData?.name || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {userData?.email || 'user@example.com'}
          </Text>
          <Text style={styles.memberSince}>
            Member for {memberDays} days
          </Text>
        </View>

        {/* Key Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Active Habits"
            value={stats.totalActiveHabits || 0}
            icon="🎯"
            color="#3B82F6"
          />
          <StatCard
            title="Best Streak"
            value={stats.longestStreakOverall || 0}
            icon="🔥"
            color="#F59E0B"
          />
          <StatCard
            title="Total Complete"
            value={habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0)}
            icon="✅"
            color="#10B981"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <MenuItem
            icon="✏️"
            title="Edit Profile"
            subtitle="Update your information"
            onPress={() => setShowEditProfile(true)}
          />
          
          <MenuItem
            icon="📋"
            title="Manage Habits"
            subtitle={`${habits.filter(h => !h.isArchived).length} active, ${habits.filter(h => h.isArchived).length} archived`}
            onPress={() => setShowHabitManager(true)}
          />
          
          <MenuItem
            icon="🏆"
            title="Achievements"
            subtitle={`${getAchievements().filter(a => a.unlocked).length} unlocked`}
            onPress={() => setShowAchievements(true)}
          />
        </View>

        {/* Data & Privacy */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <MenuItem
            icon="⚙️"
            title="App Settings"
            subtitle="Notifications and preferences"
            onPress={() => setShowSettings(true)}
          />
          
          <MenuItem
            icon="📤"
            title="Export Data"
            subtitle="Download your habit data"
            onPress={() => setShowDataExport(true)}
          />
          
          <MenuItem
            icon="🗑️"
            title="Clear All Data"
            subtitle="Reset your account"
            onPress={handleClearData}
            danger
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MindForge v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={editLoading}>
              <Text style={[styles.modalSave, { opacity: editLoading ? 0.5 : 1 }]}>
                {editLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ padding: 20 }}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              maxLength={50}
            />
            
            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Profile Picture URL (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.profilePicture}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, profilePicture: text }))}
              placeholder="https://example.com/avatar.jpg"
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Habit Manager Modal */}
      <Modal visible={showHabitManager} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHabitManager(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Manage Habits</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {habits.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
                <Text style={styles.emptyStateTitle}>No habits yet</Text>
                <Text style={styles.emptyStateSubtitle}>Create your first habit to get started</Text>
              </View>
            ) : (
              habits.map((habit) => (
                <HabitManageCard
                  key={habit._id}
                  habit={habit}
                  onArchive={() => handleArchiveHabit(habit._id, habit.isArchived)}
                  onDelete={() => handleDeleteHabit(habit._id, habit.name)}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Achievements Modal */}
      <Modal visible={showAchievements} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAchievements(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Achievements</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {getAchievements().map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <SettingItem
              title="Push Notifications"
              subtitle="Get reminded about your habits"
              value={settings.notifications}
              onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
            />
            
            <SettingItem
              title="Weekly Reports"
              subtitle="Receive weekly progress summaries"
              value={settings.weeklyReport}
              onValueChange={(value) => setSettings(prev => ({ ...prev, weeklyReport: value }))}
            />
            
            <SettingItem
              title="Streak Reminders"
              subtitle="Get notified about streak milestones"
              value={settings.streakReminders}
              onValueChange={(value) => setSettings(prev => ({ ...prev, streakReminders: value }))}
            />
            
            <SettingItem
              title="Motivational Quotes"
              subtitle="Daily inspiration messages"
              value={settings.motivationalQuotes}
              onValueChange={(value) => setSettings(prev => ({ ...prev, motivationalQuotes: value }))}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Data Export Modal */}
      <Modal visible={showDataExport} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDataExport(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Export Data</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <View style={{ padding: 20 }}>
            <View style={styles.dataExportCard}>
              <Text style={styles.dataExportTitle}>📊 Export Your Data</Text>
              <Text style={styles.dataExportText}>
                Download all your habit data including completion history, streaks, and statistics in JSON format.
              </Text>
              <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
                <Text style={styles.exportButtonText}>Export All Data</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dataExportCard}>
              <Text style={styles.dataExportTitle}>🔒 Data Privacy</Text>
              <Text style={styles.dataExportText}>
                Your data is stored securely and only you have access to it. We never share your personal information or habit data with third parties.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

// Menu Item Component
function MenuItem({ icon, title, subtitle, onPress, danger = false }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, danger && { color: '#EF4444' }]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

// Habit Manage Card Component
function HabitManageCard({ habit, onArchive, onDelete }) {
  const categoryColors = {
    fitness: '#EF4444',
    learning: '#3B82F6',
    health: '#06B6D4',
    personal: '#8B5CF6',
    productivity: '#F59E0B',
    other: '#6B7280',
  };

  return (
    <View style={[styles.habitCard, habit.isArchived && { opacity: 0.6 }]}>
      <View style={styles.habitCardHeader}>
        <View style={styles.habitCardInfo}>
          <View style={[styles.habitDot, { backgroundColor: categoryColors[habit.category] }]} />
          <Text style={styles.habitName}>{habit.name}</Text>
          {habit.isArchived && (
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedText}>Archived</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.habitStats}>
        <Text style={styles.habitStat}>Streak: {habit.streak || 0} days</Text>
        <Text style={styles.habitStat}>Total: {habit.totalCompletions || 0}</Text>
      </View>
      
      <View style={styles.habitActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onArchive}>
          <Text style={styles.actionButtonText}>
            {habit.isArchived ? 'Unarchive' : 'Archive'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }) {
  return (
    <View style={[styles.achievementCard, !achievement.unlocked && styles.lockedAchievement]}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
          {achievement.title}
        </Text>
        <Text style={[styles.achievementDescription, !achievement.unlocked && styles.lockedText]}>
          {achievement.description}
        </Text>
        {achievement.progress && (
          <Text style={styles.achievementProgress}>{achievement.progress}</Text>
        )}
      </View>
      {achievement.unlocked && (
        <View style={styles.unlockedBadge}>
          <Text style={styles.unlockedText}>✓</Text>
        </View>
      )}
    </View>
  );
}

// Setting Item Component
function SettingItem({ title, subtitle, value, onValueChange }) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  scrollView: { flex: 1 },
  
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#6B7280' },
  
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  userEmail: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  memberSince: { fontSize: 12, color: '#9CA3AF' },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 2 },
  menuSubtitle: { fontSize: 14, color: '#6B7280' },
  menuArrow: { fontSize: 18, color: '#9CA3AF' },
  
  logoutContainer: { paddingHorizontal: 20, marginBottom: 20 },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  
  versionContainer: { alignItems: 'center', paddingBottom: 40 },
  versionText: { fontSize: 12, color: '#9CA3AF' },
  
  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  modalCancel: { fontSize: 16, color: '#6B7280' },
  modalSave: { fontSize: 16, color: '#3B82F6', fontWeight: '500' },
  
  inputLabel: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  
  // Habit management styles
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitCardHeader: { marginBottom: 12 },
  habitCardInfo: { flexDirection: 'row', alignItems: 'center' },
  habitDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  habitName: { fontSize: 16, fontWeight: '500', color: '#111827', flex: 1 },
  archivedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  archivedText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
  habitStats: { flexDirection: 'row', marginBottom: 12, gap: 16 },
  habitStat: { fontSize: 12, color: '#6B7280' },
  habitActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  deleteButton: { backgroundColor: '#FEF2F2' },
  deleteButtonText: { color: '#DC2626' },
  
  // Achievement styles
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lockedAchievement: { opacity: 0.5 },
  achievementIcon: { fontSize: 32, marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  achievementDescription: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  achievementProgress: { fontSize: 12, color: '#9CA3AF' },
  lockedText: { color: '#9CA3AF' },
  unlockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
  
  // Settings styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 2 },
  settingSubtitle: { fontSize: 14, color: '#6B7280' },
  
  // Data export styles
  dataExportCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataExportTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  dataExportText: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 16 },
  exportButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptyStateSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
};