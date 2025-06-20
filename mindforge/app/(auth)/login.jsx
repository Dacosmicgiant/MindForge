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

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const response = await api.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (response.success) {
        console.log('✅ Login successful:', response.data);
        // Token is automatically stored by the API service
        // Redirect to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Login Failed',
          response.error || 'Invalid email or password. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(
        'Error',
        'Unable to sign in. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    router.push('/(auth)/signup');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented soon. Please contact support if you need immediate assistance.',
      [{ text: 'OK' }]
    );
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
            justifyContent: 'center',
          }}>
            
            {/* Header */}
            <View style={{
              alignItems: 'center',
              marginBottom: 48,
            }}>
              {/* App Icon */}
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#3B82F6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <Text style={{
                  fontSize: 32,
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                }}>
                  🎯
                </Text>
              </View>

              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 8,
              }}>
                Welcome Back
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
              }}>
                Sign in to continue your habit journey
              </Text>
            </View>

            {/* Form Fields */}
            <View style={{ marginBottom: 32 }}>
              
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
                placeholder="Enter your password"
                error={errors.password}
                secureTextEntry
                textContentType="password"
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  marginTop: 8,
                  marginBottom: 8,
                }}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={{
                  fontSize: 14,
                  color: '#3B82F6',
                  fontWeight: '500',
                }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 24,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleLogin}
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
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Signup Link */}
            <TouchableOpacity
              style={{
                paddingVertical: 16,
              }}
              onPress={handleSignupRedirect}
              disabled={loading}
            >
              <Text style={{
                color: '#6B7280',
                fontSize: 16,
                textAlign: 'center',
              }}>
                Don't have an account?{' '}
                <Text style={{
                  color: '#3B82F6',
                  fontWeight: '600',
                }}>
                  Sign Up
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Demo Account Info */}
            <View style={{
              marginTop: 32,
              padding: 16,
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}>
                🎮 Demo Account
              </Text>
              <Text style={{
                fontSize: 13,
                color: '#6B7280',
                lineHeight: 18,
              }}>
                Email: demo@example.com{'\n'}
                Password: demo123456
              </Text>
            </View>
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