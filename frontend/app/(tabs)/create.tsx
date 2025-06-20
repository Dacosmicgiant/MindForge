import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiService from '../../services/api';

const CATEGORIES = [
  { id: 'health', name: 'Health', icon: 'fitness', color: '#EF4444' },
  { id: 'fitness', name: 'Fitness', icon: 'barbell', color: '#F97316' },
  { id: 'learning', name: 'Learning', icon: 'book', color: '#3B82F6' },
  { id: 'productivity', name: 'Productivity', icon: 'trending-up', color: '#8B5CF6' },
  { id: 'personal', name: 'Personal', icon: 'heart', color: '#EC4899' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: '#10B981' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'hard', name: 'Hard', color: '#EF4444' },
];

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6',
  '#EC4899', '#6B7280',
];

export default function CreateHabitScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [difficulty, setDifficulty] = useState('medium');
  const [color, setColor] = useState('#3B82F6');
  const [reminderTime, setReminderTime] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setLoading(true);
    try {
      const habitData = {
        name: name.trim(),
        description: description.trim(),
        category,
        difficulty,
        color,
        reminderTime: reminderTime || undefined,
      };

      await apiService.createHabit(habitData);
      
      Alert.alert('Success', 'Habit created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setName('');
            setDescription('');
            setCategory('other');
            setDifficulty('medium');
            setColor('#3B82F6');
            setReminderTime('');
            
            // Navigate to dashboard
            router.push('/(tabs)/dashboard');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Habit</Text>
          <Text style={styles.subtitle}>Build a new healthy routine</Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Exercise, Read Books"
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description of your habit"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          {/* Reminder Time */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reminder Time (Optional)</Text>
            <TextInput
              style={styles.input}
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="e.g., 07:30, 20:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <Text style={styles.helper}>Format: HH:MM (24-hour format)</Text>
          </View>

          {/* Category Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.categoryOptionSelected,
                    { borderColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.id ? '#FFFFFF' : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
              {DIFFICULTIES.map((diff) => (
                <TouchableOpacity
                  key={diff.id}
                  style={[
                    styles.difficultyOption,
                    difficulty === diff.id && [
                      styles.difficultyOptionSelected,
                      { backgroundColor: diff.color },
                    ],
                  ]}
                  onPress={() => setDifficulty(diff.id)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      difficulty === diff.id && styles.difficultyTextSelected,
                    ]}
                  >
                    {diff.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
              {COLORS.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption },
                    color === colorOption && styles.colorOptionSelected,
                  ]}
                  onPress={() => setColor(colorOption)}
                >
                  {color === colorOption && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  helper: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryOptionSelected: {
    backgroundColor: '#6366F1',
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    borderColor: 'transparent',
  },
  difficultyText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  difficultyTextSelected: {
    color: '#FFFFFF',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#374151',
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});