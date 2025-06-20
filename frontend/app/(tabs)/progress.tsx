import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/api';

interface Habit {
  _id: string;
  name: string;
  color: string;
  streak: number;
  longestStreak: number;
  totalCompletions: number;
}

interface ProgressData {
  habitId: string;
  habitName: string;
  history: Array<{
    date: string;
    completed: boolean;
    notes: string;
  }>;
  statistics: {
    completedDays: number;
    totalDays: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
  };
}

const { width } = Dimensions.get('window');
const DAYS_TO_SHOW = 7;

export default function ProgressScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const loadHabits = async () => {
    try {
      const response = await apiService.getHabits();
      const habitsData = response.habits || [];
      setHabits(habitsData);
      
      // Auto-select first habit if available
      if (habitsData.length > 0 && !selectedHabit) {
        setSelectedHabit(habitsData[0]._id);
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getHabitStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

    const loadProgressData = async (habitId: string) => {
    setProgressLoading(true);
    try {
        const response = await apiService.getHabitProgress(habitId, DAYS_TO_SHOW);
        if (response.progress) {
        const transformedProgress: ProgressData = {
            habitId: response.progress.habitId,
            habitName: response.progress.habitName,
            history: response.progress.history,
            statistics: response.progress.statistics,
        };
        setProgressData(transformedProgress);
        } else {
        setProgressData(null);
        }
    } catch (error) {
        console.error('Failed to load progress data:', error);
        setProgressData(null);
    } finally {
        setProgressLoading(false);
    }
    };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadHabits(), loadStats()]);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (selectedHabit) {
      loadProgressData(selectedHabit);
    }
  }, [selectedHabit]);

  const renderWeeklyProgress = () => {
    if (!progressData) return null;

    const { history } = progressData;
    const dayWidth = (width - 80) / DAYS_TO_SHOW;

    return (
      <View style={styles.weeklyContainer}>
        <Text style={styles.sectionTitle}>7-Day Progress</Text>
        <View style={styles.weeklyGrid}>
          {history.map((day, index) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();

            return (
              <View key={index} style={[styles.dayColumn, { width: dayWidth }]}>
                <Text style={styles.dayName}>{dayName}</Text>
                <View
                  style={[
                    styles.dayBox,
                    day.completed && styles.dayBoxCompleted,
                  ]}
                >
                  {day.completed && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.dayNumber}>{dayNumber}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderStatistics = () => {
    if (!progressData) return null;

    const { statistics } = progressData;

    return (
      <View style={styles.statisticsContainer}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalCompletions}</Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (habits.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No habits to track</Text>
          <Text style={styles.emptyText}>Create some habits first to see your progress!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Overall Stats */}
        {stats && (
          <View style={styles.overallStatsContainer}>
            <Text style={styles.pageTitle}>Your Progress</Text>
            <View style={styles.overallStatsGrid}>
              <View style={styles.overallStatCard}>
                <Text style={styles.overallStatNumber}>{stats.totalActiveHabits}</Text>
                <Text style={styles.overallStatLabel}>Active Habits</Text>
              </View>
              <View style={styles.overallStatCard}>
                <Text style={styles.overallStatNumber}>{stats.todayCompletionRate}%</Text>
                <Text style={styles.overallStatLabel}>Today's Rate</Text>
              </View>
              <View style={styles.overallStatCard}>
                <Text style={styles.overallStatNumber}>{stats.weeklyCompletionRate}%</Text>
                <Text style={styles.overallStatLabel}>Weekly Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Habit Selector */}
        <View style={styles.habitSelectorContainer}>
          <Text style={styles.sectionTitle}>Select Habit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitSelector}>
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit._id}
                style={[
                  styles.habitSelectorItem,
                  selectedHabit === habit._id && styles.habitSelectorItemSelected,
                ]}
                onPress={() => setSelectedHabit(habit._id)}
              >
                <View style={[styles.habitColorIndicator, { backgroundColor: habit.color }]} />
                <Text
                  style={[
                    styles.habitSelectorText,
                    selectedHabit === habit._id && styles.habitSelectorTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Progress Content */}
        {progressLoading ? (
          <View style={styles.progressLoadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading habit progress...</Text>
          </View>
        ) : progressData ? (
          <>
            {renderWeeklyProgress()}
            {renderStatistics()}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Select a habit to view progress</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  overallStatsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  overallStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  overallStatCard: {
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
  overallStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  habitSelectorContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  habitSelector: {
    paddingHorizontal: 20,
  },
  habitSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitSelectorItemSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  habitColorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  habitSelectorText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    maxWidth: 120,
  },
  habitSelectorTextSelected: {
    color: '#FFFFFF',
  },
  progressLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
  },
  weeklyContainer: {
    marginBottom: 24,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayBoxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  dayNumber: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statisticsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});