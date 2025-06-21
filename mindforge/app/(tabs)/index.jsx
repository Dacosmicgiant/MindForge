// mindforge/app/(tabs)/index.jsx - Production Ready Dashboard
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { notificationService, celebrateCompletion, notifyStreak } from '../../services/notifications';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({});
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [notificationsReady, setNotificationsReady] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch user profile, habits, and stats concurrently
      const [profileResponse, habitsResponse, statsResponse] = await Promise.all([
        api.getProfile(),
        api.getHabits(),
        api.getHabitStats()
      ]);

      // Handle user profile
      if (profileResponse.success) {
        setUserData(profileResponse.data.user);
      }

      // Handle habits
      if (habitsResponse.success) {
        setHabits(habitsResponse.data.habits || []);
      }

      // Handle stats
      if (statsResponse.success) {
        setStats(statsResponse.data.stats || {});
      }

      // Clear any previous errors
      setError(null);

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    }
  }, []);

  // Initialize notifications ONLY ONCE when the app starts
  useEffect(() => {
    const initNotifications = async () => {
      if (notificationsInitialized) {
        return;
      }

      try {
        const isReady = await notificationService.initialize();
        setNotificationsReady(isReady);
        
        // Load notification settings
        const settings = await notificationService.getNotificationSettings();
        setNotificationSettings(settings);
        
        // Mark as initialized to prevent future initializations
        setNotificationsInitialized(true);
        
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initNotifications();
  }, []); // Empty dependency array - only run once

  // Sync notifications with habits ONLY when habits change significantly
  useEffect(() => {
    const syncNotifications = async () => {
      if (!notificationsReady || !notificationsInitialized || habits.length === 0) {
        return;
      }

      try {
        // Only sync if we have habits with reminder times
        const habitsWithReminders = habits.filter(h => h.reminderTime && h.isActive && !h.isArchived);
        
        if (habitsWithReminders.length > 0) {
          // Schedule all reminders
          await notificationService.scheduleAllHabitReminders(habits);
          
          // Refresh notification settings
          const settings = await notificationService.getNotificationSettings();
          setNotificationSettings(settings);
        }
      } catch (error) {
        console.error('❌ Error syncing notifications:', error);
      }
    };

    // Only sync once when habits are first loaded
    if (habits.length > 0 && notificationsReady && !loading) {
      syncNotifications();
    }
  }, [habits.length, notificationsReady, loading]); // Only trigger when habits count changes

  // Initial load
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadDashboard();
  }, [fetchDashboardData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    
    // Only refresh notification settings, don't re-schedule
    if (notificationsReady) {
      try {
        const settings = await notificationService.getNotificationSettings();
        setNotificationSettings(settings);
      } catch (error) {
        console.error('❌ Error refreshing notification settings:', error);
      }
    }
    
    setRefreshing(false);
  }, [fetchDashboardData, notificationsReady]);

  // Toggle habit completion with notification integration
  const handleToggleHabit = async (habitId, currentStatus) => {
    try {
      const response = await api.markHabit(habitId, {
        completed: !currentStatus,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });

      if (response.success) {
        const updatedHabit = response.data.habit;
        const habit = habits.find(h => h._id === habitId);
        
        // Update local state immediately for better UX
        setHabits(prevHabits => 
          prevHabits.map(h => 
            h._id === habitId 
              ? { 
                  ...h, 
                  completedToday: !currentStatus,
                  streak: updatedHabit.streak || h.streak,
                  totalCompletions: updatedHabit.totalCompletions || h.totalCompletions
                }
              : h
          )
        );

        // Send celebration notification if habit was completed
        if (!currentStatus && notificationsReady && habit) {
          try {
            // Celebrate completion
            await celebrateCompletion(habit);
            
            // Check for streak milestones
            const newStreak = updatedHabit.streak || 0;
            const previousStreak = habit.streak || 0;
            
            // Only notify if we hit a new milestone
            if (newStreak > previousStreak && [7, 14, 30, 50, 100].includes(newStreak)) {
              await notifyStreak(habit, newStreak);
            }
          } catch (notificationError) {
            console.error('❌ Error sending celebration notification:', notificationError);
            // Don't fail the habit toggle if notification fails
          }
        }

        // Refresh stats to get updated counts
        const statsResponse = await api.getHabitStats();
        if (statsResponse.success) {
          setStats(statsResponse.data.stats || {});
        }

      } else {
        Alert.alert(
          'Error',
          'Failed to update habit. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error toggling habit:', error);
      Alert.alert(
        'Connection Error',
        'Unable to update habit. Please check your connection.',
        [{ text: 'OK' }]
      );
    }
  };

  // Navigate to create habit
  const handleCreateHabit = () => {
    router.push('/(tabs)/create');
  };

  // Navigate to progress
  const handleViewProgress = () => {
    router.push('/(tabs)/progress');
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate completion percentage for today
  const getTodayCompletionRate = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(habit => habit.completedToday).length;
    return Math.round((completed / habits.length) * 100);
  };

  // Get current streak info
  const getCurrentStreak = () => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(habit => habit.streak || 0), 0);
  };

  // Notification status badge component
  function NotificationStatusBadge() {
    if (!notificationSettings || notificationSettings.permissions === 'granted') return null;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          borderWidth: 1,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
          marginTop: 8,
        }}
        onPress={() => {
          Alert.alert(
            'Enable Notifications',
            'Get reminded about your daily habits by enabling notifications in your device Settings.',
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'How to Enable', 
                onPress: () => {
                  Alert.alert(
                    'Enable Notifications',
                    Platform.OS === 'ios' 
                      ? 'Go to Settings > Notifications > MindForge and turn on notifications.'
                      : 'Go to Settings > Apps > MindForge > Notifications and enable notifications.'
                  );
                }
              }
            ]
          );
        }}
      >
        <Text style={{
          fontSize: 12,
          color: '#DC2626',
          fontWeight: '500',
          textAlign: 'center',
        }}>
          🔕 Tap to enable habit reminders
        </Text>
      </TouchableOpacity>
    );
  }

  // Notification sync status component
  function NotificationSyncStatus() {
    const [syncStatus, setSyncStatus] = useState('checking');

    useEffect(() => {
      const checkSync = async () => {
        if (!notificationsReady || !notificationSettings) {
          setSyncStatus('disabled');
          return;
        }

        const habitsWithReminders = habits.filter(h => h.reminderTime && h.isActive && !h.isArchived);
        
        if (habitsWithReminders.length > 0) {
          if (notificationSettings.scheduledCount >= habitsWithReminders.length) {
            setSyncStatus('synced');
          } else {
            setSyncStatus('needs_sync');
          }
        } else {
          setSyncStatus('none');
        }
      };

      if (habits.length > 0) {
        checkSync();
      }
    }, [habits, notificationsReady, notificationSettings]);

    const getStatusInfo = () => {
      switch (syncStatus) {
        case 'synced':
          return { icon: '🔔', text: 'Reminders active', color: '#10B981' };
        case 'needs_sync':
          return { icon: '⚠️', text: 'Needs sync', color: '#F59E0B' };
        case 'disabled':
          return { icon: '🔕', text: 'Reminders off', color: '#6B7280' };
        case 'none':
          return { icon: '💡', text: 'Add reminder times', color: '#6B7280' };
        default:
          return { icon: '⏳', text: 'Checking...', color: '#6B7280' };
      }
    };

    const statusInfo = getStatusInfo();
    const habitsWithReminders = habits.filter(h => h.reminderTime);

    if (syncStatus === 'none') return null;

    return (
      <View style={{
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 8,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 11,
          color: statusInfo.color,
          fontWeight: '500',
        }}>
          {statusInfo.icon} {statusInfo.text}
        </Text>
        <Text style={{
          fontSize: 10,
          color: '#9CA3AF',
          marginTop: 2,
        }}>
          {habitsWithReminders.length} habit{habitsWithReminders.length !== 1 ? 's' : ''} with reminders
        </Text>
        
        {/* Manual sync button for needs_sync status */}
        {syncStatus === 'needs_sync' && (
          <TouchableOpacity
            style={{
              backgroundColor: '#F59E0B',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              marginTop: 4,
            }}
            onPress={async () => {
              try {
                setSyncStatus('syncing');
                await notificationService.scheduleAllHabitReminders(habits);
                const settings = await notificationService.getNotificationSettings();
                setNotificationSettings(settings);
                setSyncStatus('synced');
              } catch (error) {
                console.error('❌ Error manual sync:', error);
                setSyncStatus('needs_sync');
              }
            }}
          >
            <Text style={{
              fontSize: 10,
              color: '#FFFFFF',
              fontWeight: '500',
            }}>
              Sync Now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
            Loading your habits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }} // Account for tab bar
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header with Personalized Greeting */}
        <View style={{
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
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 4,
          }}>
            {getGreeting()}{userData?.name ? `, ${userData.name}!` : '!'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
          }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          {/* Notification Status Badge */}
          <NotificationStatusBadge />
        </View>

        {/* Error Message */}
        {error && (
          <View style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            borderWidth: 1,
            margin: 20,
            padding: 16,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#DC2626', fontSize: 14 }}>
              {error}
            </Text>
            <TouchableOpacity 
              style={{ marginTop: 8 }}
              onPress={() => {
                setError(null);
                onRefresh();
              }}
            >
              <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '500' }}>
                Tap to retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Enhanced Stats Cards with Real Data */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginTop: 16,
          marginBottom: 24,
          gap: 12,
        }}>
          <StatCard
            title="Today"
            value={`${stats.habitsCompletedToday || 0}/${stats.totalActiveHabits || 0}`}
            subtitle="Completed"
            color="#3B82F6"
            icon="✅"
            percentage={getTodayCompletionRate()}
          />
          <StatCard
            title="Best Streak"
            value={getCurrentStreak()}
            subtitle="Days"
            color="#10B981"
            icon="🔥"
            showTrend={true}
          />
        </View>

        {/* Weekly Performance Summary */}
        {stats.weeklyCompletionRate !== undefined && (
          <View style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 8,
            }}>
              Weekly Performance
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{
                fontSize: 14,
                color: '#6B7280',
              }}>
                Average completion rate this week
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: stats.weeklyCompletionRate >= 70 ? '#10B981' : 
                       stats.weeklyCompletionRate >= 50 ? '#F59E0B' : '#EF4444',
              }}>
                {stats.weeklyCompletionRate}%
              </Text>
            </View>
            
            {/* Notification Sync Status */}
            <NotificationSyncStatus />
          </View>
        )}

        {/* Today's Habits */}
        <View style={{
          marginHorizontal: 20,
          marginBottom: 20,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#111827',
            }}>
              Today's Habits
            </Text>
            {habits.length > 0 && (
              <Text style={{
                fontSize: 14,
                color: '#6B7280',
              }}>
                {habits.filter(h => h.completedToday).length} of {habits.length} done
              </Text>
            )}
          </View>

          {habits.length === 0 ? (
            <EmptyHabitsState onCreateHabit={handleCreateHabit} />
          ) : (
            habits.map((habit) => (
              <HabitItem
                key={habit._id}
                habit={habit}
                onToggle={() => handleToggleHabit(habit._id, habit.completedToday)}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        {habits.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            marginBottom: 40,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 16,
            }}>
              Quick Actions
            </Text>

            <View style={{
              flexDirection: 'row',
              gap: 12,
            }}>
              <QuickActionButton
                title="Add Habit"
                icon="➕"
                color="#3B82F6"
                onPress={handleCreateHabit}
              />
              <QuickActionButton
                title="View Progress"
                icon="📊"
                color="#8B5CF6"
                onPress={handleViewProgress}
              />
            </View>
          </View>
        )}

        {/* Motivational Footer */}
        {habits.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            marginBottom: 20,
            backgroundColor: '#F0F9FF',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <Text style={{
              fontSize: 14,
              color: '#1E40AF',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              {getTodayCompletionRate() === 100 ? 
                "🎉 Amazing! You've completed all your habits today!" :
                getTodayCompletionRate() >= 80 ?
                "🌟 You're doing great! Keep up the excellent work!" :
                getTodayCompletionRate() >= 50 ?
                "💪 Good progress! You're more than halfway there!" :
                "🚀 Every small step counts. You've got this!"
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, subtitle, color, icon, percentage, showTrend }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>{icon}</Text>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#6B7280',
          flex: 1,
        }}>
          {title}
        </Text>
        {showTrend && (
          <Text style={{ fontSize: 12, color: '#10B981' }}>📈</Text>
        )}
      </View>
      
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: color,
        marginBottom: 4,
      }}>
        {value}
      </Text>
      
      <Text style={{
        fontSize: 12,
        color: '#9CA3AF',
      }}>
        {subtitle}
      </Text>

      {/* Progress indicator for today's completion */}
      {percentage !== undefined && (
        <View style={{
          marginTop: 8,
          height: 4,
          backgroundColor: '#E5E7EB',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <View style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 2,
          }} />
        </View>
      )}
    </View>
  );
}

// Enhanced Habit Item Component
function HabitItem({ habit, onToggle }) {
  const categoryColors = {
    fitness: '#EF4444',
    learning: '#3B82F6',
    health: '#06B6D4',
    personal: '#8B5CF6',
    productivity: '#F59E0B',
    other: '#6B7280',
  };

  const difficultyIndicators = {
    easy: '●',
    medium: '●●',
    hard: '●●●',
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: habit.completedToday ? '#D1FAE5' : '#E5E7EB',
        backgroundColor: habit.completedToday ? '#F0FDF4' : '#FFFFFF',
      }}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {/* Completion Checkbox */}
      <View style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: habit.completedToday ? '#10B981' : '#D1D5DB',
        backgroundColor: habit.completedToday ? '#10B981' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        {habit.completedToday && (
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
            ✓
          </Text>
        )}
      </View>

      {/* Habit Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: habit.completedToday ? '#6B7280' : '#111827',
          textDecorationLine: habit.completedToday ? 'line-through' : 'none',
          marginBottom: 4,
        }}>
          {habit.name}
        </Text>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: categoryColors[habit.category] || '#6B7280',
              marginRight: 6,
            }} />
            <Text style={{
              fontSize: 12,
              color: '#6B7280',
              textTransform: 'capitalize',
              marginRight: 8,
            }}>
              {habit.category}
            </Text>
            <Text style={{
              fontSize: 10,
              color: '#9CA3AF',
              marginRight: 8,
            }}>
              {difficultyIndicators[habit.difficulty] || '●'}
            </Text>
            {habit.reminderTime && (
              <Text style={{
                fontSize: 10,
                color: '#9CA3AF',
              }}>
                🔔 {habit.reminderTime}
              </Text>
            )}
          </View>

          {/* Streak indicator */}
          {habit.streak > 0 && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 12, marginRight: 2 }}>🔥</Text>
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#F59E0B',
              }}>
                {habit.streak}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Empty State Component
function EmptyHabitsState({ onCreateHabit }) {
  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      padding: 32,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        Ready to build great habits?
      </Text>
      <Text style={{
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
      }}>
        Start your journey to a better you.{'\n'}
        Create your first habit to get started.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#3B82F6',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
        onPress={onCreateHabit}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
        }}>
          Create Your First Habit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Quick Action Button Component
function QuickActionButton({ title, icon, color, onPress }) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{
        fontSize: 24,
        marginBottom: 8,
      }}>
        {icon}
      </Text>
      <Text style={{
        fontSize: 14,
        fontWeight: '500',
        color: color,
        textAlign: 'center',
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}