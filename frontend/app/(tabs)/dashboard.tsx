import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/api';
import { useAuth } from '../../services/AuthContext';

interface Habit {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  color: string;
  streak: number;
  completedToday: boolean;
  reminderTime?: string;
}

export default function DashboardScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { user } = useAuth();

  const loadHabits = async () => {
    try {
      const response = await apiService.getHabits();
      setHabits(response.habits || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load habits');
      console.error('Failed to load habits:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getHabitStats();
      setStats(response.stats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadHabits(), loadStats()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleHabit = async (habitId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await apiService.markHabit(habitId, newStatus);
      
      // Update local state
      setHabits(prev =>
        prev.map(habit =>
          habit._id === habitId
            ? { ...habit, completedToday: newStatus }
            : habit
        )
      );

      // Reload stats to get updated completion rate
      loadStats();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update habit');
      console.error('Failed to toggle habit:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <View style={styles.habitCard}>
      <View style={styles.habitHeader}>
        <View style={styles.habitInfo}>
          <View style={styles.habitTitleRow}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
            <Text style={styles.habitName}>{item.name}</Text>
          </View>
          {item.description ? (
            <Text style={styles.habitDescription}>{item.description}</Text>
          ) : null}
          <View style={styles.habitMeta}>
            <Text style={styles.metaText}>{item.category}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.difficulty}</Text>
            {item.streak > 0 && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.streakText}>🔥 {item.streak} day streak</Text>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.checkButton,
            item.completedToday && styles.checkButtonCompleted,
          ]}
          onPress={() => toggleHabit(item._id, item.completedToday)}
        >
          <Ionicons
            name={item.completedToday ? 'checkmark' : 'checkmark'}
            size={24}
            color={item.completedToday ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}! 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedToday}/{totalHabits}</Text>
            <Text style={styles.statLabel}>Today's Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.longestStreakOverall}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      )}

      <View style={styles.habitsSection}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="add-circle-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>Create your first habit to get started!</Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            renderItem={renderHabitItem}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.habitsList}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  habitsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  habitsList: {
    paddingBottom: 20,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  habitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 16,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  streakText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});