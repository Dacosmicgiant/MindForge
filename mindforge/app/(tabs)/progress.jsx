import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch latest progress data from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Placeholder data - replace with real API data
  const overallStats = {
    totalHabits: 5,
    activeStreak: 7,
    longestStreak: 21,
    completionRate: 72,
  };

  const weeklyData = [
    { day: 'Mon', completed: 4, total: 5 },
    { day: 'Tue', completed: 5, total: 5 },
    { day: 'Wed', completed: 3, total: 5 },
    { day: 'Thu', completed: 4, total: 5 },
    { day: 'Fri', completed: 5, total: 5 },
    { day: 'Sat', completed: 2, total: 5 },
    { day: 'Sun', completed: 3, total: 5 },
  ];

  const habitProgress = [
    { id: 1, name: 'Morning Exercise', streak: 12, completionRate: 85, category: 'fitness' },
    { id: 2, name: 'Read 20 minutes', streak: 8, completionRate: 92, category: 'learning' },
    { id: 3, name: 'Drink 8 glasses of water', streak: 15, completionRate: 78, category: 'health' },
    { id: 4, name: 'Meditation', streak: 5, completionRate: 65, category: 'personal' },
    { id: 5, name: 'Write Journal', streak: 3, completionRate: 58, category: 'personal' },
  ];

  const periods = [
    { id: 'week', name: '7 Days' },
    { id: 'month', name: '30 Days' },
    { id: 'year', name: '365 Days' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['left', 'right']}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <View style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
          marginBottom: 16,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 20,
          }}>
            Your Progress
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <OverviewCard
              title="Total Habits"
              value={overallStats.totalHabits}
              icon="🎯"
              color="#3B82F6"
            />
            <OverviewCard
              title="Current Streak"
              value={`${overallStats.activeStreak} days`}
              icon="🔥"
              color="#EF4444"
            />
            <OverviewCard
              title="Best Streak"
              value={`${overallStats.longestStreak} days`}
              icon="🏆"
              color="#F59E0B"
            />
            <OverviewCard
              title="Completion Rate"
              value={`${overallStats.completionRate}%`}
              icon="📈"
              color="#10B981"
            />
          </View>
        </View>

        {/* Period Selection */}
        <View style={{
          paddingHorizontal: 20,
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
                  paddingVertical: 8,
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

        {/* Weekly Chart */}
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
            marginBottom: 8,
          }}>
            {weeklyData.map((day, index) => (
              <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 24,
                  backgroundColor: '#3B82F6',
                  borderRadius: 4,
                  marginBottom: 8,
                  height: (day.completed / day.total) * 80,
                  minHeight: 4,
                }} />
                <Text style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  {day.day}
                </Text>
                <Text style={{
                  fontSize: 10,
                  color: '#9CA3AF',
                  marginTop: 2,
                }}>
                  {day.completed}/{day.total}
                </Text>
              </View>
            ))}
          </View>
        </View>

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

          {habitProgress.map((habit) => (
            <HabitProgressCard key={habit.id} habit={habit} />
          ))}
        </View>
      </ScrollView>
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
        {title}
      </Text>
    </View>
  );
}

// Habit Progress Card Component
function HabitProgressCard({ habit }) {
  const categoryColors = {
    fitness: '#EF4444',
    learning: '#3B82F6',
    health: '#06B6D4',
    personal: '#8B5CF6',
    productivity: '#F59E0B',
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }}>
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
          color: getPerformanceColor(habit.completionRate),
        }}>
          {habit.completionRate}%
        </Text>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginRight: 12,
          }}>
            🔥 {habit.streak} day streak
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{
          flex: 1,
          height: 6,
          backgroundColor: '#E5E7EB',
          borderRadius: 3,
          marginLeft: 12,
          overflow: 'hidden',
        }}>
          <View style={{
            width: `${habit.completionRate}%`,
            height: '100%',
            backgroundColor: getPerformanceColor(habit.completionRate),
            borderRadius: 3,
          }} />
        </View>
      </View>
    </View>
  );
}