import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export default function CreateHabitScreen() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'personal',
    difficulty: 'medium',
    reminderTime: '',
    color: '#3B82F6'
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'health', name: 'Health', icon: '🏥', color: '#06B6D4' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: '#EF4444' },
    { id: 'learning', name: 'Learning', icon: '📚', color: '#3B82F6' },
    { id: 'productivity', name: 'Productivity', icon: '⚡', color: '#F59E0B' },
    { id: 'personal', name: 'Personal', icon: '🧘', color: '#8B5CF6' },
    { id: 'other', name: 'Other', icon: '📝', color: '#6B7280' },
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy', color: '#10B981', description: 'Simple daily task' },
    { id: 'medium', name: 'Medium', color: '#F59E0B', description: 'Moderate effort required' },
    { id: 'hard', name: 'Hard', color: '#EF4444', description: 'Challenging commitment' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateHabit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.createHabit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        reminderTime: formData.reminderTime || null,
        color: formData.color
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          'Your habit has been created successfully.',
          [
            {
              text: 'Create Another',
              style: 'default',
              onPress: () => {
                setFormData({
                  name: '',
                  description: '',
                  category: 'personal',
                  difficulty: 'medium',
                  reminderTime: '',
                  color: '#3B82F6'
                });
              }
            },
            {
              text: 'View Habits',
              style: 'default',
              onPress: () => {
                // TODO: Navigate to dashboard or habits list
                console.log('Navigate to habits dashboard');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          response.error || 'Failed to create habit. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Create habit error:', error);
      Alert.alert(
        'Error',
        'Unable to create habit. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 140 }} // Account for tab bar + extra space
          keyboardShouldPersistTaps="handled"
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
              Create New Habit
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
            }}>
              Start building a positive routine today
            </Text>
          </View>

          <View style={{ padding: 20 }}>
            
            {/* Habit Name */}
            <FormSection title="Habit Name *">
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="e.g., Drink 8 glasses of water"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
              />
            </FormSection>

            {/* Description */}
            <FormSection title="Description (Optional)">
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Add details about your habit..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
            </FormSection>

            {/* Category Selection */}
            <FormSection title="Category">
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: formData.category === category.id ? category.color : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: formData.category === category.id ? category.color : '#D1D5DB',
                      marginBottom: 8,
                    }}
                    onPress={() => handleInputChange('category', category.id)}
                  >
                    <Text style={{ marginRight: 6 }}>{category.icon}</Text>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: formData.category === category.id ? '#FFFFFF' : '#374151',
                    }}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FormSection>

            {/* Difficulty Selection */}
            <FormSection title="Difficulty Level">
              <View style={{ gap: 8 }}>
                {difficulties.map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: formData.difficulty === difficulty.id ? difficulty.color + '15' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: formData.difficulty === difficulty.id ? difficulty.color : '#E5E7EB',
                    }}
                    onPress={() => handleInputChange('difficulty', difficulty.id)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: difficulty.color,
                      marginRight: 12,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: 2,
                      }}>
                        {difficulty.name}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#6B7280',
                      }}>
                        {difficulty.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </FormSection>

            {/* Reminder Time */}
            <FormSection title="Reminder Time (Optional)">
              <TextInput
                style={styles.textInput}
                value={formData.reminderTime}
                onChangeText={(value) => handleInputChange('reminderTime', value)}
                placeholder="e.g., 09:00 (24-hour format)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <Text style={{
                fontSize: 12,
                color: '#6B7280',
                marginTop: 4,
              }}>
                Format: HH:MM (e.g., 09:00 for 9:00 AM)
              </Text>
            </FormSection>

            {/* Create Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 16,
                borderRadius: 12,
                marginTop: 32,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleCreateHabit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  Create Habit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Form Section Component
function FormSection({ title, children }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
      }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = {
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
};