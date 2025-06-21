// mindforge/app/(tabs)/create.jsx - Complete version with notification integration
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { notificationService } from '../../services/notifications';

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
  const [existingHabits, setExistingHabits] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTimeHelper, setShowTimeHelper] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [notificationSettings, setNotificationSettings] = useState(null);

  // Enhanced categories with descriptions and recommendations
  const categories = [
    { 
      id: 'health', 
      name: 'Health', 
      icon: '🏥', 
      color: '#06B6D4',
      description: 'Physical and mental wellbeing',
      examples: ['Drink water', 'Take vitamins', 'Stretch']
    },
    { 
      id: 'fitness', 
      name: 'Fitness', 
      icon: '💪', 
      color: '#EF4444',
      description: 'Exercise and physical activity',
      examples: ['Morning jog', 'Gym workout', 'Yoga']
    },
    { 
      id: 'learning', 
      name: 'Learning', 
      icon: '📚', 
      color: '#3B82F6',
      description: 'Education and skill development',
      examples: ['Read books', 'Learn language', 'Online course']
    },
    { 
      id: 'productivity', 
      name: 'Productivity', 
      icon: '⚡', 
      color: '#F59E0B',
      description: 'Work and task management',
      examples: ['Plan day', 'Clear inbox', 'Deep work']
    },
    { 
      id: 'personal', 
      name: 'Personal', 
      icon: '🧘', 
      color: '#8B5CF6',
      description: 'Self-care and personal growth',
      examples: ['Meditate', 'Journal', 'Gratitude']
    },
    { 
      id: 'other', 
      name: 'Other', 
      icon: '📝', 
      color: '#6B7280',
      description: 'Custom habits and activities',
      examples: ['Call family', 'Practice hobby', 'Clean']
    },
  ];

  const difficulties = [
    { 
      id: 'easy', 
      name: 'Easy', 
      color: '#10B981', 
      description: 'Simple daily task',
      details: '5-10 minutes, minimal effort',
      icon: '🟢'
    },
    { 
      id: 'medium', 
      name: 'Medium', 
      color: '#F59E0B', 
      description: 'Moderate effort required',
      details: '15-30 minutes, some planning',
      icon: '🟡'
    },
    { 
      id: 'hard', 
      name: 'Hard', 
      color: '#EF4444', 
      description: 'Challenging commitment',
      details: '30+ minutes, significant effort',
      icon: '🔴'
    },
  ];

  // Color palette for habits
  const colorPalette = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#22C55E', '#A855F7', '#0EA5E9'
  ];

  // Popular habit templates
  const habitTemplates = [
    {
      name: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      category: 'health',
      difficulty: 'easy',
      reminderTime: '09:00',
      color: '#06B6D4'
    },
    {
      name: 'Morning exercise',
      description: '30 minutes of physical activity',
      category: 'fitness',
      difficulty: 'medium',
      reminderTime: '07:00',
      color: '#EF4444'
    },
    {
      name: 'Read for 20 minutes',
      description: 'Daily reading habit',
      category: 'learning',
      difficulty: 'easy',
      reminderTime: '20:00',
      color: '#3B82F6'
    },
    {
      name: 'Meditation',
      description: '10 minutes of mindfulness',
      category: 'personal',
      difficulty: 'medium',
      reminderTime: '06:30',
      color: '#8B5CF6'
    },
    {
      name: 'Write journal',
      description: 'Reflect on your day',
      category: 'personal',
      difficulty: 'easy',
      reminderTime: '21:30',
      color: '#F59E0B'
    },
    {
      name: 'Plan tomorrow',
      description: 'Prepare for the next day',
      category: 'productivity',
      difficulty: 'easy',
      reminderTime: '22:00',
      color: '#10B981'
    }
  ];

  // Fetch existing habits and stats for smart suggestions
  useEffect(() => {
    fetchUserData();
    loadNotificationSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const [habitsResponse, statsResponse] = await Promise.all([
        api.getHabits(),
        api.getHabitStats()
      ]);

      if (habitsResponse.success) {
        setExistingHabits(habitsResponse.data.habits || []);
      }

      if (statsResponse.success) {
        setUserStats(statsResponse.data.stats || {});
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await notificationService.getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Habit name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Habit name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Habit name cannot exceed 100 characters';
    }

    // Check for duplicate habit names
    const duplicateHabit = existingHabits.find(
      habit => habit.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (duplicateHabit) {
      errors.name = 'You already have a habit with this name';
    }

    if (formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.reminderTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.reminderTime)) {
      errors.reminderTime = 'Please use HH:MM format (e.g., 09:00)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateHabit = async () => {
    if (!validateForm()) {
      Alert.alert('Please fix the errors', 'Check the form for validation messages');
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
        const newHabit = response.data.habit;
        
        // Schedule notification if reminder time is set
        if (newHabit.reminderTime) {
          try {
            console.log('🔔 Scheduling notification for new habit...');
            const notificationId = await notificationService.scheduleHabitReminder(newHabit);
            
            if (notificationId) {
              console.log('✅ Notification scheduled successfully');
            } else {
              console.log('⚠️ Failed to schedule notification - may need to enable permissions');
            }
          } catch (notificationError) {
            console.error('❌ Error scheduling notification:', notificationError);
            // Don't fail the habit creation if notification fails
          }
        }

        // Success feedback with options
        Alert.alert(
          '🎉 Habit Created!',
          `"${formData.name}" has been added to your daily habits.${
            formData.reminderTime ? `\n🔔 Daily reminders set for ${formData.reminderTime}` : ''
          }`,
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
                // Refresh data for suggestions
                fetchUserData();
              }
            },
            {
              text: 'View My Habits',
              style: 'default',
              onPress: () => {
                router.push('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Creation Failed',
          response.error || 'Failed to create habit. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Create habit error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to create habit. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply habit template
  const applyTemplate = (template) => {
    setFormData(template);
    setShowTemplates(false);
  };

  // Smart suggestion based on existing habits
  const getSuggestions = () => {
    if (existingHabits.length === 0) return [];
    
    const existingCategories = existingHabits.map(h => h.category);
    const underrepresentedCategories = categories.filter(
      cat => !existingCategories.includes(cat.id)
    );
    
    return underrepresentedCategories.slice(0, 2);
  };

  // Get time suggestion based on existing habits
  const getTimeSuggestion = () => {
    if (existingHabits.length === 0) return '';
    
    const existingTimes = existingHabits
      .map(h => h.reminderTime)
      .filter(Boolean)
      .sort();
    
    if (existingTimes.length === 0) return '09:00';
    
    // Suggest a time that's not too close to existing ones
    const suggestions = ['07:00', '09:00', '12:00', '18:00', '20:00'];
    return suggestions.find(time => !existingTimes.includes(time)) || '';
  };

  // Notification status card component
  function NotificationStatusCard() {
    if (!notificationSettings) return null;

    return (
      <View style={{
        backgroundColor: notificationSettings.permissions === 'granted' ? '#ECFDF5' : '#FEF2F2',
        borderColor: notificationSettings.permissions === 'granted' ? '#D1FAE5' : '#FECACA',
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>
            {notificationSettings.permissions === 'granted' ? '🔔' : '🔕'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: notificationSettings.permissions === 'granted' ? '#047857' : '#DC2626',
            fontWeight: '500',
            flex: 1,
          }}>
            {notificationSettings.permissions === 'granted' 
              ? 'Notifications enabled - You\'ll receive daily reminders' 
              : 'Notifications disabled - Enable in Settings to get reminders'
            }
          </Text>
        </View>
        
        {notificationSettings.permissions !== 'granted' && (
          <TouchableOpacity 
            style={{ 
              marginTop: 8,
              backgroundColor: '#FFFFFF',
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
            onPress={() => {
              Alert.alert(
                'Enable Notifications',
                'To receive habit reminders, please enable notifications in your device Settings.',
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
              🔔 Tap for instructions to enable notifications
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <View style={{ flex: 1 }}>
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
              
              {/* Templates Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#F3F4F6',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                onPress={() => setShowTemplates(true)}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  Templates
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* User Stats */}
            {userStats.totalActiveHabits > 0 && (
              <View style={{
                backgroundColor: '#F0F9FF',
                padding: 12,
                borderRadius: 8,
                marginTop: 8,
              }}>
                <Text style={{
                  fontSize: 14,
                  color: '#1E40AF',
                  fontWeight: '500',
                }}>
                  You have {userStats.totalActiveHabits} active habits with {userStats.todayCompletionRate}% completion rate
                </Text>
              </View>
            )}
          </View>

          {/* Notification Status */}
          <View style={{ padding: 20, paddingBottom: 0 }}>
            <NotificationStatusCard />
          </View>

          <View style={{ padding: 20, paddingTop: 0 }}>
            
            {/* Suggestions */}
            {getSuggestions().length > 0 && (
              <View style={{
                backgroundColor: '#FFFBEB',
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#FED7AA',
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#92400E',
                  marginBottom: 8,
                }}>
                  💡 Suggestion
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#B45309',
                  marginBottom: 12,
                }}>
                  You don't have any {getSuggestions().map(s => s.name.toLowerCase()).join(' or ')} habits yet. Consider adding one!
                </Text>
                <View style={{
                  flexDirection: 'row',
                  gap: 8,
                }}>
                  {getSuggestions().map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={{
                        backgroundColor: category.color + '20',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: category.color + '40',
                      }}
                      onPress={() => handleInputChange('category', category.id)}
                    >
                      <Text style={{
                        fontSize: 12,
                        color: category.color,
                        fontWeight: '500',
                      }}>
                        {category.icon} {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Habit Name */}
            <FormSection title="Habit Name *" error={formErrors.name}>
              <TextInput
                style={[
                  styles.textInput,
                  formErrors.name && { borderColor: '#EF4444' }
                ]}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="e.g., Drink 8 glasses of water"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
              />
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 4,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: formErrors.name ? '#EF4444' : '#6B7280',
                }}>
                  {formErrors.name || 'Be specific and actionable'}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                }}>
                  {formData.name.length}/100
                </Text>
              </View>
            </FormSection>

            {/* Description */}
            <FormSection title="Description (Optional)" error={formErrors.description}>
              <TextInput
                style={[
                  styles.textInput,
                  { height: 80, textAlignVertical: 'top' },
                  formErrors.description && { borderColor: '#EF4444' }
                ]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Add details about your habit..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 4,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: formErrors.description ? '#EF4444' : '#6B7280',
                }}>
                  {formErrors.description || 'Help you remember why this habit matters'}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                }}>
                  {formData.description.length}/500
                </Text>
              </View>
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
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: formData.category === category.id ? category.color : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: formData.category === category.id ? category.color : '#D1D5DB',
                      marginBottom: 8,
                      minWidth: '45%',
                    }}
                    onPress={() => handleInputChange('category', category.id)}
                  >
                    <Text style={{ marginRight: 8, fontSize: 16 }}>{category.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: formData.category === category.id ? '#FFFFFF' : '#374151',
                        marginBottom: 2,
                      }}>
                        {category.name}
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: formData.category === category.id ? '#FFFFFF' + 'CC' : '#6B7280',
                      }}>
                        {category.description}
                      </Text>
                    </View>
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
                    <Text style={{ fontSize: 20, marginRight: 12 }}>{difficulty.icon}</Text>
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
                        fontSize: 14,
                        color: '#6B7280',
                        marginBottom: 2,
                      }}>
                        {difficulty.description}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#9CA3AF',
                      }}>
                        {difficulty.details}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </FormSection>

            {/* Reminder Time */}
            <FormSection title="Reminder Time (Optional)" error={formErrors.reminderTime}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <TextInput
                  style={[
                    styles.textInput,
                    { flex: 1 },
                    formErrors.reminderTime && { borderColor: '#EF4444' }
                  ]}
                  value={formData.reminderTime}
                  onChangeText={(value) => handleInputChange('reminderTime', value)}
                  placeholder="e.g., 09:00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderRadius: 8,
                  }}
                  onPress={() => {
                    const suggestion = getTimeSuggestion();
                    if (suggestion) {
                      handleInputChange('reminderTime', suggestion);
                    }
                    setShowTimeHelper(true);
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: '#374151',
                  }}>
                    Suggest
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={{
                fontSize: 12,
                color: formErrors.reminderTime ? '#EF4444' : '#6B7280',
                marginTop: 4,
              }}>
                {formErrors.reminderTime || 'Format: HH:MM (e.g., 09:00 for 9:00 AM)'}
              </Text>

              {showTimeHelper && (
                <View style={{
                  backgroundColor: '#F9FAFB',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 8,
                  }}>
                    💡 Popular Times
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
                    {['06:00', '07:00', '09:00', '12:00', '18:00', '20:00', '22:00'].map(time => (
                      <TouchableOpacity
                        key={time}
                        style={{
                          backgroundColor: '#FFFFFF',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                        }}
                        onPress={() => {
                          handleInputChange('reminderTime', time);
                          setShowTimeHelper(false);
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          color: '#374151',
                        }}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: 8 }}
                    onPress={() => setShowTimeHelper(false)}
                  >
                    <Text style={{
                      fontSize: 12,
                      color: '#6B7280',
                      textAlign: 'center',
                    }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </FormSection>

            {/* Color Selection */}
            <FormSection title="Color Theme">
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: formData.color,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }} />
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    flex: 1,
                  }}
                  onPress={() => setShowColorPicker(true)}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    textAlign: 'center',
                  }}>
                    Choose Color
                  </Text>
                </TouchableOpacity>
              </View>
            </FormSection>

            {/* Habit Preview */}
            <FormSection title="Preview">
              <View style={{
                backgroundColor: '#FFFFFF',
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#6B7280',
                  marginBottom: 12,
                }}>
                  This is how your habit will appear:
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 8,
                }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#D1D5DB',
                    marginRight: 12,
                  }} />
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#111827',
                      marginBottom: 2,
                    }}>
                      {formData.name || 'Your habit name'}
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: formData.color,
                        marginRight: 6,
                      }} />
                      <Text style={{
                        fontSize: 12,
                        color: '#6B7280',
                        textTransform: 'capitalize',
                      }}>
                        {formData.category}
                      </Text>
                      {formData.reminderTime && (
                        <>
                          <Text style={{
                            fontSize: 12,
                            color: '#9CA3AF',
                            marginHorizontal: 8,
                          }}>
                            •
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: '#6B7280',
                          }}>
                            🔔 {formData.reminderTime}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </FormSection>

            {/* Create Button */}
            <TouchableOpacity
              style={{
                backgroundColor: formData.name.trim() ? '#3B82F6' : '#9CA3AF',
                paddingVertical: 16,
                borderRadius: 12,
                marginTop: 32,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleCreateHabit}
              disabled={loading || !formData.name.trim()}
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

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
      >
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
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#111827',
            }}>
              Habit Templates
            </Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
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
            {habitTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
                onPress={() => applyTemplate(template)}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: template.color,
                    marginRight: 8,
                  }} />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#111827',
                    flex: 1,
                  }}>
                    {template.name}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#6B7280',
                    textTransform: 'capitalize',
                  }}>
                    {template.category}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginBottom: 8,
                }}>
                  {template.description}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: '#9CA3AF',
                  }}>
                    {difficulties.find(d => d.id === template.difficulty)?.name}
                  </Text>
                  {template.reminderTime && (
                    <Text style={{
                      fontSize: 12,
                      color: '#9CA3AF',
                    }}>
                      🔔 {template.reminderTime}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
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
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#111827',
            }}>
              Choose Color
            </Text>
            <TouchableOpacity onPress={() => setShowColorPicker(false)}>
              <Text style={{
                fontSize: 16,
                color: '#3B82F6',
                fontWeight: '500',
              }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{
            padding: 20,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'center',
          }}>
            {colorPalette.map((color) => (
              <TouchableOpacity
                key={color}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: color,
                  borderWidth: formData.color === color ? 3 : 2,
                  borderColor: formData.color === color ? '#111827' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleInputChange('color', color)}
              />
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Form Section Component
function FormSection({ title, children, error }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: error ? '#EF4444' : '#374151',
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