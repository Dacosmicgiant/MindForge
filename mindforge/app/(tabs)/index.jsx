import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch latest habits from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Placeholder data - replace with real API data
  const todayStats = {
    completed: 3,
    total: 5,
    streak: 7,
  };

  const habits = [
    { id: 1, name: 'Morning Exercise', completed: true, category: 'fitness' },
    { id: 2, name: 'Read 20 minutes', completed: true, category: 'learning' },
    { id: 3, name: 'Drink 8 glasses of water', completed: true, category: 'health' },
    { id: 4, name: 'Meditation', completed: false, category: 'personal' },
    { id: 5, name: 'Write Journal', completed: false, category: 'personal' },
  ];

  const handleToggleHabit = (habitId) => {
    // TODO: Call API to mark/unmark habit
    console.log('Toggle habit:', habitId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }} // Account for tab bar
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Internal Header - replaces removed tab header */}
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
            My Habits
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
        </View>

        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginTop: 16,
          marginBottom: 24,
          gap: 12,
        }}>
          <StatCard
            title="Today"
            value={`${todayStats.completed}/${todayStats.total}`}
            subtitle="Completed"
            color="#3B82F6"
            icon="✅"
          />
          <StatCard
            title="Streak"
            value={todayStats.streak}
            subtitle="Days"
            color="#10B981"
            icon="🔥"
          />
        </View>

        {/* Today's Habits */}
        <View style={{
          marginHorizontal: 20,
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 16,
          }}>
            Today's Habits
          </Text>

          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={() => handleToggleHabit(habit.id)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{
          marginHorizontal: 20,
          marginBottom: 20,
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
              onPress={() => console.log('Navigate to create habit')}
            />
            <QuickActionButton
              title="View Progress"
              icon="📊"
              color="#8B5CF6"
              onPress={() => console.log('Navigate to progress')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, color, icon }) {
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
        }}>
          {title}
        </Text>
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
    </View>
  );
}

// Habit Item Component
function HabitItem({ habit, onToggle }) {
  const categoryColors = {
    fitness: '#EF4444',
    learning: '#3B82F6',
    health: '#06B6D4',
    personal: '#8B5CF6',
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
        borderColor: '#E5E7EB',
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
        borderColor: habit.completed ? '#10B981' : '#D1D5DB',
        backgroundColor: habit.completed ? '#10B981' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        {habit.completed && (
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
          color: habit.completed ? '#6B7280' : '#111827',
          textDecorationLine: habit.completed ? 'line-through' : 'none',
        }}>
          {habit.name}
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 4,
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
          }}>
            {habit.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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