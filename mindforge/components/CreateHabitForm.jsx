// components/CreateHabitForm.js - Form for Creating New Habits
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitActions } from '../contexts/HabitContext';

const CATEGORIES = [
  { id: 'health', name: 'Health', icon: '🏥', color: '#10B981' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: '#EF4444' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#3B82F6' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', color: '#F59E0B' },
  { id: 'personal', name: 'Personal', icon: '🌟', color: '#8B5CF6' },
  { id: 'other', name: 'Other', icon: '📝', color: '#6B7280' },
];

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: '#10B981' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'hard', name: 'Hard', color: '#EF4444' },
];

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

export default function CreateHabitForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    difficulty: 'medium',
    color: '#3B82F6',
    reminderTime: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createHabit, error, clearError } = useHabitActions();
  const router = useRouter();

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a habit name');
      return false;
    }
    
    if (formData.name.trim().length < 2) {
      Alert.alert('Validation Error', 'Habit name must be at least 2 characters long');
      return false;
    }

    if (formData.reminderTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.reminderTime)) {
      Alert.alert('Validation Error', 'Please enter reminder time in HH:MM format (24-hour)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const habitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      color: formData.color,
      reminderTime: formData.reminderTime || null,
    };
    
    const result = await createHabit(habitData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        `"${result.habit.name}" has been created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                description: '',
                category: 'health',
                difficulty: 'medium',
                color: '#3B82F6',
                reminderTime: '',
              });
              // Navigate to dashboard
              router.push('/(tabs)');
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="e.g., Morning Exercise, Read Books"
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Describe your habit and goals..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.optionsGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.optionCard,
                  formData.category === category.id && styles.optionCardSelected,
                  { borderColor: category.color }
                ]}
                onPress={() => updateField('category', category.id)}
              >
                <Text style={styles.optionIcon}>{category.icon}</Text>
                <Text style={[
                  styles.optionText,
                  formData.category === category.id && styles.optionTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.optionsRow}>
            {DIFFICULTIES.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyCard,
                  formData.difficulty === difficulty.id && {
                    backgroundColor: difficulty.color,
                    borderColor: difficulty.color,
                  }
                ]}
                onPress={() => updateField('difficulty', difficulty.id)}
              >
                <Text style={[
                  styles.difficultyText,
                  formData.difficulty === difficulty.id && styles.difficultyTextSelected
                ]}>
                  {difficulty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Theme</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  formData.color === color && styles.colorOptionSelected
                ]}
                onPress={() => updateField('color', color)}
              >
                {formData.color === color && (
                  <Text style={styles.colorCheckIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminder (Optional)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time (24-hour format)</Text>
            <TextInput
              style={styles.input}
              value={formData.reminderTime}
              onChangeText={(value) => updateField('reminderTime', value)}
              placeholder="e.g., 07:30, 20:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.hint}>
              Leave empty to skip reminders. Format: HH:MM (e.g., 07:30)
            </Text>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: formData.color },
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Create Habit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    width: '30%',
    minWidth: 100,
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  difficultyTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#111827',
  },
  colorCheckIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});