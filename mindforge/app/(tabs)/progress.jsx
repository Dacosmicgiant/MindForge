// This file should replace the content in mindforge/app/(tabs)/progress.jsx
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showHabitDetail, setShowHabitDetail] = useState(false);
  
  // Data states
  const [habits, setHabits] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [habitProgress, setHabitProgress] = useState({});
  const [userData, setUserData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [error, setError] = useState(null);

  // Period configurations
  const periods = [
    { id: 'week', name: '7 Days', days: 7 },
    { id: 'month', name: '30 Days', days: 30 },
    { id: 'year', name: '365 Days', days: 365 },
  ];

  // Fetch all progress data
  const fetchProgressData = useCallback(async () => {
    try {
      console.log('🔄 Fetching progress data...');
      
      const currentPeriod = periods.find(p => p.id === selectedPeriod);
      
      // Fetch user profile, habits, and stats concurrently
      const [profileResponse, habitsResponse, statsResponse] = await Promise.all([
        api.getProfile(),
        api.getHabits(),
        api.getHabitStats()
      ]);

      if (profileResponse.success) {
        setUserData(profileResponse.data.user);
      }

      if (statsResponse.success) {
        setOverallStats(statsResponse.data.stats || {});
      }

      if (habitsResponse.success) {
        const habitsData = habitsResponse.data.habits || [];
        setHabits(habitsData);
        
        // Fetch detailed progress for each habit
        const progressPromises = habitsData.map(habit => 
          api.getHabitProgress(habit._id, currentPeriod.days)
        );
        
        const progressResponses = await Promise.all(progressPromises);
        const progressMap = {};
        
        progressResponses.forEach((response, index) => {
          if (response.success) {
            const habitId = habitsData[index]._id;
            progressMap[habitId] = response.data.progress;
          }
        });
        
        setHabitProgress(progressMap);
        
        // Generate weekly overview data for chart
        generateWeeklyOverview(habitsData, progressMap);
      }

      setError(null);
      console.log('✅ Progress data loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching progress data:', error);
      setError('Failed to load progress data. Please try again.');
    }
  }, [selectedPeriod]);

  // Generate weekly overview data for the chart
  const generateWeeklyOverview = (habitsData, progressMap) => {
    if (habitsData.length === 0) {
      setWeeklyData([]);
      return;
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      let completed = 0;
      const total = habitsData.length;
      
      // Count completed habits for this day across all habits
      habitsData.forEach(habit => {
        const progress = progressMap[habit._id];
        if (progress && progress.history) {
          const dayRecord = progress.history.find(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === date.getTime();
          });
          
          if (dayRecord && dayRecord.completed) {
            completed++;
          }
        }
      });
      
      weekData.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], // Convert Sunday=0 to index 6
        date: date.toISOString().split('T')[0],
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }
    
    setWeeklyData(weekData);
  };

  // Initial load
  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      await fetchProgressData();
      setLoading(false);
    };
    loadProgress();
  }, [fetchProgressData]);

  // Refresh data when period changes
  useEffect(() => {
    if (!loading) {
      fetchProgressData();
    }
  }, [selectedPeriod, fetchProgressData, loading]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  }, [fetchProgressData]);

  // Show habit detail modal
  const showHabitDetails = (habit) => {
    setSelectedHabit(habit);
    setShowHabitDetail(true);
  };

  // Get performance insights
  const getPerformanceInsights = () => {
    if (habits.length === 0) return [];
    
    const insights = [];
    const currentPeriod = periods.find(p => p.id === selectedPeriod);
    
    // Best performing habit
    const bestHabit = habits.reduce((best, habit) => {
      const progress = habitProgress[habit._id];
      if (!progress) return best;
      
      const bestRate = best ? (habitProgress[best._id]?.statistics?.completionRate || 0) : 0;
      const currentRate = progress.statistics?.completionRate || 0;
      
      return currentRate > bestRate ? habit : best;
    }, null);
    
    if (bestHabit) {
      const rate = habitProgress[bestHabit._id]?.statistics?.completionRate || 0;
      insights.push({
        type: 'success',
        icon: '🏆',
        title: 'Top Performer',
        message: `${bestHabit.name} has ${rate}% completion rate`
      });
    }
    
    // Struggling habit
    const strugglingHabit = habits.reduce((worst, habit) => {
      const progress = habitProgress[habit._id];
      if (!progress) return worst;
      
      const worstRate = worst ? (habitProgress[worst._id]?.statistics?.completionRate || 100) : 100;
      const currentRate = progress.statistics?.completionRate || 0;
      
      return currentRate < worstRate && currentRate < 50 ? habit : worst;
    }, null);
    
    if (strugglingHabit) {
      const rate = habitProgress[strugglingHabit._id]?.statistics?.completionRate || 0;
      insights.push({
        type: 'warning',
        icon: '💡',
        title: 'Needs Attention',
        message: `${strugglingHabit.name} only ${rate}% completed. Consider adjusting difficulty or timing.`
      });
    }
    
    // Streak achievement
    const maxStreak = Math.max(...habits.map(h => h.streak || 0));
    if (maxStreak >= 7) {
      insights.push({
        type: 'achievement',
        icon: '🔥',
        title: 'Streak Master',
        message: `Amazing! You have a ${maxStreak}-day streak going!`
      });
    }
    
    // Weekly trend
    const weeklyAvg = overallStats.weeklyCompletionRate || 0;
    if (weeklyAvg >= 80) {
      insights.push({
        type: 'success',
        icon: '📈',
        title: 'Excellent Progress',
        message: `${weeklyAvg}% completion rate this week. Keep it up!`
      });
    } else if (weeklyAvg < 50) {
      insights.push({
        type: 'motivational',
        icon: '💪',
        title: 'Room for Growth',
        message: `${weeklyAvg}% this week. Small improvements lead to big results!`
      });
    }
    
    return insights;
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    if (habits.length === 0) return [];
    
    const categoryStats = {};
    
    habits.forEach(habit => {
      const category = habit.category;
      const progress = habitProgress[habit._id];
      
      if (!categoryStats[category]) {
        categoryStats[category] = {
          name: category,
          habits: 0,
          totalCompletions: 0,
          totalPossible: 0,
          bestStreak: 0
        };
      }
      
      categoryStats[category].habits++;
      categoryStats[category].bestStreak = Math.max(
        categoryStats[category].bestStreak, 
        habit.streak || 0
      );
      
      if (progress && progress.statistics) {
        categoryStats[category].totalCompletions += progress.statistics.completedDays;
        categoryStats[category].totalPossible += progress.statistics.totalDays;
      }
    });
    
    return Object.values(categoryStats).map(cat => ({
      ...cat,
      completionRate: cat.totalPossible > 0 ? 
        Math.round((cat.totalCompletions / cat.totalPossible) * 100) : 0
    })).sort((a, b) => b.completionRate - a.completionRate);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
            Analyzing your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
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
            fontSize: 28,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 4,
          }}>
            Your Progress
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
          }}>
            {userData?.name ? `${userData.name}'s habit journey` : 'Track your habit journey and achievements'}
          </Text>
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

        {/* Overview Stats */}
        <View style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
          marginTop: 16,
          marginHorizontal: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 16,
          }}>
            Overview
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <OverviewCard
              title="Active Habits"
              value={overallStats.totalActiveHabits || 0}
              icon="🎯"
              color="#3B82F6"
            />
            <OverviewCard
              title="Done Today"
              value={`${overallStats.habitsCompletedToday || 0}/${overallStats.totalActiveHabits || 0}`}
              icon="✅"
              color="#10B981"
            />
            <OverviewCard
              title="Best Streak"
              value={`${overallStats.longestStreakOverall || 0} days`}
              icon="🔥"
              color="#F59E0B"
            />
            <OverviewCard
              title="Weekly Rate"
              value={`${overallStats.weeklyCompletionRate || 0}%`}
              icon="📈"
              color={overallStats.weeklyCompletionRate >= 70 ? "#10B981" : 
                     overallStats.weeklyCompletionRate >= 50 ? "#F59E0B" : "#EF4444"}
            />
          </View>
        </View>

        {/* Period Selection */}
        <View style={{
          paddingHorizontal: 20,
          marginTop: 20,
          marginBottom: 20,
        }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 4,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: selectedPeriod === period.id ? '#3B82F6' : 'transparent',
                }}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '500',
                  color: selectedPeriod === period.id ? '#FFFFFF' : '#6B7280',
                }}>
                  {period.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Progress Chart */}
        {selectedPeriod === 'week' && weeklyData.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 16,
            }}>
              This Week's Progress
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'end',
              height: 120,
              marginBottom: 12,
            }}>
              {weeklyData.map((day, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={{ alignItems: 'center', flex: 1 }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 28,
                    backgroundColor: day.percentage >= 70 ? '#10B981' : 
                                   day.percentage >= 50 ? '#F59E0B' : '#EF4444',
                    borderRadius: 4,
                    marginBottom: 8,
                    height: Math.max((day.percentage / 100) * 80, 4),
                    minHeight: 4,
                  }} />
                  <Text style={{
                    fontSize: 12,
                    color: '#6B7280',
                    fontWeight: '500',
                    marginBottom: 2,
                  }}>
                    {day.day}
                  </Text>
                  <Text style={{
                    fontSize: 10,
                    color: '#9CA3AF',
                  }}>
                    {day.completed}/{day.total}
                  </Text>
                  <Text style={{
                    fontSize: 9,
                    color: '#9CA3AF',
                    marginTop: 1,
                  }}>
                    {day.percentage}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{
              backgroundColor: '#F9FAFB',
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
            }}>
              <Text style={{
                fontSize: 12,
                color: '#6B7280',
                textAlign: 'center',
              }}>
                Weekly Average: {Math.round(weeklyData.reduce((sum, day) => sum + day.percentage, 0) / weeklyData.length)}%
              </Text>
            </View>
          </View>
        )}

        {/* Performance Insights */}
        {getPerformanceInsights().length > 0 && (
          <View style={{
            marginHorizontal: 20,
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 16,
            }}>
              Insights
            </Text>

            {getPerformanceInsights().map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>
        )}

        {/* Category Breakdown */}
        {getCategoryBreakdown().length > 0 && (
          <View style={{
            marginHorizontal: 20,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 16,
            }}>
              Category Performance
            </Text>

            {getCategoryBreakdown().map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </View>
        )}

        {/* Individual Habit Progress */}
        <View style={{
          marginHorizontal: 20,
          marginBottom: 40,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 16,
          }}>
            Habit Performance
          </Text>

          {habits.length === 0 ? (
            <View style={{
              backgroundColor: '#FFFFFF',
              padding: 32,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#6B7280',
                textAlign: 'center',
              }}>
                No habits to track yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#9CA3AF',
                textAlign: 'center',
                marginTop: 8,
              }}>
                Create your first habit to see progress
              </Text>
            </View>
          ) : (
            habits.map((habit) => (
              <HabitProgressCard 
                key={habit._id} 
                habit={habit} 
                progress={habitProgress[habit._id]}
                onPress={() => showHabitDetails(habit)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Habit Detail Modal */}
      <Modal
        visible={showHabitDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedHabit && (
          <HabitDetailModal 
            habit={selectedHabit}
            progress={habitProgress[selectedHabit._id]}
            onClose={() => setShowHabitDetail(false)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

// Overview Card Component
function OverviewCard({ title, value, icon, color }) {
  return (
    <View style={{
      flex: 1,
      minWidth: '45%',
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      alignItems: 'center',
    }}>
      <Text style={{
        fontSize: 24,
        marginBottom: 8,
      }}>
        {icon}
      </Text>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: color,
        marginBottom: 4,
        textAlign: 'center',
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
      }}>
        {title}
      </Text>
    </View>
  );
}

// Insight Card Component
function InsightCard({ insight }) {
  const bgColors = {
    success: '#ECFDF5',
    warning: '#FFFBEB',
    achievement: '#FDF4FF',
    motivational: '#EFF6FF'
  };

  const borderColors = {
    success: '#D1FAE5',
    warning: '#FED7AA',
    achievement: '#F3E8FF',
    motivational: '#DBEAFE'
  };

  const textColors = {
    success: '#047857',
    warning: '#92400E',
    achievement: '#7C2D12',
    motivational: '#1E40AF'
  };

  return (
    <View style={{
      backgroundColor: bgColors[insight.type] || '#F9FAFB',
      borderColor: borderColors[insight.type] || '#E5E7EB',
      borderWidth: 1,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}>
        <Text style={{
          fontSize: 20,
          marginRight: 12,
        }}>
          {insight.icon}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: textColors[insight.type] || '#374151',
            marginBottom: 4,
          }}>
            {insight.title}
          </Text>
          <Text style={{
            fontSize: 14,
            color: textColors[insight.type] || '#6B7280',
            lineHeight: 20,
          }}>
            {insight.message}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Category Card Component
function CategoryCard({ category }) {
  const categoryIcons = {
    health: '🏥',
    fitness: '💪',
    learning: '📚',
    productivity: '⚡',
    personal: '🧘',
    other: '📝'
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    }}>
      <Text style={{ fontSize: 20, marginRight: 12 }}>
        {categoryIcons[category.name] || '📝'}
      </Text>
      
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#111827',
            textTransform: 'capitalize',
          }}>
            {category.name}
          </Text>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: getPerformanceColor(category.completionRate),
          }}>
            {category.completionRate}%
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{
            fontSize: 12,
            color: '#6B7280',
          }}>
            {category.habits} habit{category.habits !== 1 ? 's' : ''} • Best streak: {category.bestStreak} days
          </Text>
          
          <View style={{
            width: 60,
            height: 4,
            backgroundColor: '#E5E7EB',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${category.completionRate}%`,
              height: '100%',
              backgroundColor: getPerformanceColor(category.completionRate),
              borderRadius: 2,
            }} />
          </View>
        </View>
      </View>
    </View>
  );
}

// Habit Progress Card Component
function HabitProgressCard({ habit, progress, onPress }) {
  const categoryColors = {
    fitness: '#EF4444',
    learning: '#3B82F6',
    health: '#06B6D4',
    personal: '#8B5CF6',
    productivity: '#F59E0B',
    other: '#6B7280',
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const completionRate = progress?.statistics?.completionRate || 0;
  const currentStreak = habit.streak || 0;
  const totalCompletions = progress?.statistics?.completedDays || 0;
  const totalDays = progress?.statistics?.totalDays || 0;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <View style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: categoryColors[habit.category] || '#6B7280',
          marginRight: 8,
        }} />
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: '#111827',
          flex: 1,
        }}>
          {habit.name}
        </Text>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: getPerformanceColor(completionRate),
        }}>
          {completionRate}%
        </Text>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
          <Text style={{
            fontSize: 12,
            color: '#6B7280',
          }}>
            🔥 {currentStreak} day streak
          </Text>
          <Text style={{
            fontSize: 12,
            color: '#6B7280',
          }}>
            ✅ {totalCompletions}/{totalDays} completed
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${completionRate}%`,
          height: '100%',
          backgroundColor: getPerformanceColor(completionRate),
          borderRadius: 3,
        }} />
      </View>
      
      <Text style={{
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'right',
      }}>
        Tap for details
      </Text>
    </TouchableOpacity>
  );
}

// Habit Detail Modal Component
function HabitDetailModal({ habit, progress, onClose }) {
  const categoryColors = {
    fitness: '#EF4444',
    learning: '#3B82F6',
    health: '#06B6D4',
    personal: '#8B5CF6',
    productivity: '#F59E0B',
    other: '#6B7280',
  };

  const stats = progress?.statistics || {};
  const history = progress?.history || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 4,
          }}>
            {habit.name}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: categoryColors[habit.category],
              marginRight: 6,
            }} />
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              textTransform: 'capitalize',
            }}>
              {habit.category}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={onClose}>
          <Text style={{
            fontSize: 16,
            color: '#3B82F6',
            fontWeight: '500',
          }}>
            Close
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Statistics */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 16,
          }}>
            Statistics
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <StatItem 
              label="Completion Rate"
              value={`${stats.completionRate || 0}%`}
              color="#3B82F6"
            />
            <StatItem 
              label="Current Streak"
              value={`${stats.currentStreak || 0} days`}
              color="#F59E0B"
            />
            <StatItem 
              label="Best Streak"
              value={`${habit.longestStreak || 0} days`}
              color="#EF4444"
            />
            <StatItem 
              label="Total Completions"
              value={stats.totalCompletions || 0}
              color="#10B981"
            />
          </View>
        </View>

        {/* Recent History */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 16,
          }}>
            Recent Activity
          </Text>
          
          {history.slice(0, 10).map((record, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: index < 9 ? 1 : 0,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: record.completed ? '#10B981' : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                {record.completed && (
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    ✓
                  </Text>
                )}
              </View>
              
              <Text style={{
                fontSize: 14,
                color: '#374151',
                flex: 1,
              }}>
                {new Date(record.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
              
              <Text style={{
                fontSize: 12,
                color: record.completed ? '#10B981' : '#9CA3AF',
                fontWeight: '500',
              }}>
                {record.completed ? 'Completed' : 'Missed'}
              </Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {habit.description && (
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 12,
            }}>
              Description
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              lineHeight: 20,
            }}>
              {habit.description}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Item Component for detail modal
function StatItem({ label, value, color }) {
  return (
    <View style={{
      minWidth: '45%',
      alignItems: 'center',
      marginBottom: 16,
    }}>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: color,
        marginBottom: 4,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );
}