// components/HabitCard.js - Individual Habit Display Component
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useHabitActions } from '../contexts/HabitContext';

export default function HabitCard({ habit, onPress }) {
  const [isToggling, setIsToggling] = useState(false);
  const { toggleHabitCompletion, deleteHabit, archiveHabit } = useHabitActions();

  // Get category colors and icons
  const getCategoryStyle = (category) => {
    const categoryStyles = {
      health: { color: '#10B981', icon: '🏥', bg: '#ECFDF5' },
      fitness: { color: '#EF4444', icon: '💪', bg: '#FEF2F2' },
      learning: { color: '#3B82F6', icon: '📚', bg: '#EFF6FF' },
      productivity: { color: '#F59E0B', icon: '⚡', bg: '#FFFBEB' },
      personal: { color: '#8B5CF6', icon: '🌟', bg: '#F5F3FF' },
      other: { color: '#6B7280', icon: '📝', bg: '#F9FAFB' },
    };
    return categoryStyles[category] || categoryStyles.other;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10B981',
      medium: '#F59E0B',
      hard: '#EF4444',
    };
    return colors[difficulty] || colors.medium;
  };

  const categoryStyle = getCategoryStyle(habit.category);

  const handleToggleCompletion = async () => {
    setIsToggling(true);
    
    const result = await toggleHabitCompletion(
      habit._id,
      !habit.completedToday,
      habit.completedToday ? '' : 'Completed via dashboard'
    );
    
    setIsToggling(false);
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      habit.name,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Details', 
          onPress: () => onPress && onPress(habit)
        },
        { 
          text: 'Archive', 
          onPress: () => handleArchive()
        },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => handleDelete()
        },
      ]
    );
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Habit',
      `Are you sure you want to archive "${habit.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          style: 'destructive',
          onPress: async () => {
            const result = await archiveHabit(habit._id, true);
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to permanently delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteHabit(habit._id);
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        habit.completedToday && styles.completedContainer,
        { borderLeftColor: habit.color || categoryStyle.color }
      ]}
      onPress={() => onPress && onPress(habit)}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryStyle.bg }]}>
            <Text style={styles.categoryIconText}>{categoryStyle.icon}</Text>
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, habit.completedToday && styles.completedTitle]}>
              {habit.name}
            </Text>
            {habit.description && (
              <Text style={styles.description} numberOfLines={1}>
                {habit.description}
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.checkButton,
            habit.completedToday && styles.checkButtonCompleted
          ]}
          onPress={handleToggleCompletion}
          disabled={isToggling}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.checkIcon,
              habit.completedToday && styles.checkIconCompleted
            ]}>
              {habit.completedToday ? '✓' : '○'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habit.streak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habit.longestStreak || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habit.totalCompletions || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(habit.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>
              {habit.difficulty?.toUpperCase() || 'MEDIUM'}
            </Text>
          </View>
        </View>
      </View>

      {/* Reminder Time */}
      {habit.reminderTime && (
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderIcon}>⏰</Text>
          <Text style={styles.reminderText}>
            Reminder: {habit.reminderTime}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 18,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  checkIconCompleted: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  reminderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  reminderText: {
    fontSize: 12,
    color: '#6B7280',
  },
});