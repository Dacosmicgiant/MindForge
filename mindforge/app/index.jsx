import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { tokenManager } from '../services/api';

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const isAuthenticated = await tokenManager.isAuthenticated();
      
      if (isAuthenticated) {
        console.log('✅ User is authenticated, redirecting to app...');
        router.replace('/(tabs)');
        return;
      }
      
      console.log('❌ User not authenticated, showing welcome screen');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    router.push('/(auth)/signup');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          {/* App Icon */}
          <View style={styles.loadingIcon}>
            <Text style={styles.loadingIconText}>🎯</Text>
          </View>

          {/* App Name */}
          <Text style={styles.loadingTitle}>MindForge</Text>

          {/* Loading Indicator */}
          <ActivityIndicator size="large" color="#3B82F6" />
          
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Main Content Container */}
      <View style={styles.mainContainer}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          
          {/* App Icon/Logo */}
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>🎯</Text>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>MindForge</Text>

          {/* App Tagline */}
          <Text style={styles.tagline}>
            Build Better Habits,{'\n'}Forge a Better You
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <FeatureItem 
              icon="✨" 
              text="Track daily habits effortlessly" 
            />
            <FeatureItem 
              icon="📊" 
              text="Visualize your progress" 
            />
            <FeatureItem 
              icon="🔔" 
              text="Never miss with smart reminders" 
            />
          </View>
        </View>

        {/* Bottom Section - Action Buttons */}
        <View style={styles.bottomSection}>
          
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          {/* Login Option */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            Start your journey to better habits today.{'\n'}
            Join thousands of users building their best selves.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Feature Item Component
function FeatureItem({ icon, text }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingIconText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  appIconText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
  loginLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
};