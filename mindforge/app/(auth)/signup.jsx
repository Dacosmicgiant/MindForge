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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const response = await api.signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (response.success) {
        console.log('✅ Signup successful:', response.data);
        // Token is automatically stored by the API service
        // Redirect to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Signup Failed',
          response.error || 'Something went wrong. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      Alert.alert(
        'Error',
        'Unable to create account. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}>
            
            {/* Header */}
            <View style={{
              alignItems: 'center',
              marginBottom: 40,
            }}>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 8,
              }}>
                Create Account
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
              }}>
                Start your habit-building journey today
              </Text>
            </View>

            {/* Form Fields */}
            <View style={{ marginBottom: 32 }}>
              
              {/* Name Field */}
              <FormField
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter your full name"
                error={errors.name}
                autoCapitalize="words"
                textContentType="name"
              />

              {/* Email Field */}
              <FormField
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />

              {/* Password Field */}
              <FormField
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Create a password"
                error={errors.password}
                secureTextEntry
                textContentType="newPassword"
              />

              {/* Confirm Password Field */}
              <FormField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 24,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleSignup}
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
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={{
                paddingVertical: 16,
              }}
              onPress={handleLoginRedirect}
              disabled={loading}
            >
              <Text style={{
                color: '#6B7280',
                fontSize: 16,
                textAlign: 'center',
              }}>
                Already have an account?{' '}
                <Text style={{
                  color: '#3B82F6',
                  fontWeight: '600',
                }}>
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Terms Text */}
            <Text style={{
              fontSize: 12,
              color: '#9CA3AF',
              textAlign: 'center',
              marginTop: 24,
              lineHeight: 18,
            }}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: '#3B82F6' }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: '#3B82F6' }}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Form Field Component
function FormField({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  textContentType
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
      }}>
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: error ? '#EF4444' : '#D1D5DB',
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          backgroundColor: '#FFFFFF',
          color: '#111827',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        autoCorrect={false}
      />
      {error ? (
        <Text style={{
          fontSize: 14,
          color: '#EF4444',
          marginTop: 4,
        }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}