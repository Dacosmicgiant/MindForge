import { Text, View, TouchableOpacity, Image, StatusBar } from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/(auth)/signup');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Main Content Container */}
      <View style={{
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'space-between',
      }}>
        
        {/* Header Section */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          
          {/* App Icon/Logo Placeholder */}
          <View style={{
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
          }}>
            <Text style={{
              fontSize: 48,
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}>
              🎯
            </Text>
          </View>

          {/* App Name */}
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 12,
            textAlign: 'center',
          }}>
            MindForge
          </Text>

          {/* App Tagline */}
          <Text style={{
            fontSize: 18,
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: 26,
            marginBottom: 16,
          }}>
            Build Better Habits,{'\n'}Forge a Better You
          </Text>

          {/* Feature Highlights */}
          <View style={{
            marginTop: 40,
            alignItems: 'center',
          }}>
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
        <View style={{
          paddingBottom: 20,
        }}>
          
          {/* Get Started Button */}
          <TouchableOpacity
            style={{
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
            }}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              Get Started
            </Text>
          </TouchableOpacity>

          {/* Login Option */}
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              paddingHorizontal: 32,
            }}
            onPress={handleLogin}
            activeOpacity={0.7}
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

          {/* Footer Text */}
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
            textAlign: 'center',
            marginTop: 24,
            lineHeight: 18,
          }}>
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
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 20,
    }}>
      <Text style={{
        fontSize: 20,
        marginRight: 12,
      }}>
        {icon}
      </Text>
      <Text style={{
        fontSize: 16,
        color: '#4B5563',
        flex: 1,
      }}>
        {text}
      </Text>
    </View>
  );
}