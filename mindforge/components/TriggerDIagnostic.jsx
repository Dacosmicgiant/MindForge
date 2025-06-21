// TriggerDiagnostic.jsx - Test different notification trigger formats
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import * as Notifications from 'expo-notifications';

export default function TriggerDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Test different trigger formats
  const testTriggerFormats = async () => {
    setLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: "Seconds trigger (60 seconds)",
        trigger: { seconds: 60 }
      },
      {
        name: "Seconds trigger with repeats false",
        trigger: { seconds: 60, repeats: false }
      },
      {
        name: "Date trigger (1 minute from now)",
        trigger: new Date(Date.now() + 60000)
      },
      {
        name: "TimeInterval trigger",
        trigger: { type: 'timeInterval', seconds: 60 }
      },
      {
        name: "Calendar trigger (next minute)",
        trigger: (() => {
          const next = new Date();
          next.setMinutes(next.getMinutes() + 1);
          return {
            year: next.getFullYear(),
            month: next.getMonth() + 1,
            day: next.getDate(),
            hour: next.getHours(),
            minute: next.getMinutes(),
            second: 0
          };
        })()
      },
      {
        name: "Daily trigger (current time + 1 min)",
        trigger: (() => {
          const next = new Date();
          next.setMinutes(next.getMinutes() + 1);
          return {
            hour: next.getHours(),
            minute: next.getMinutes(),
            repeats: false
          };
        })()
      }
    ];

    const results = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      try {
        console.log(`🧪 Testing: ${test.name}`);
        console.log(`🧪 Trigger:`, test.trigger);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🧪 Test ${i + 1}: ${test.name}`,
            body: `Testing trigger format. Should fire in ~1 minute.`,
            data: { 
              testId: i + 1,
              testName: test.name,
              scheduledAt: new Date().toISOString()
            },
            sound: true,
          },
          trigger: test.trigger,
        });

        // Check if it was actually scheduled
        const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
        const found = allScheduled.find(n => n.identifier === notificationId);
        
        const result = {
          testName: test.name,
          notificationId,
          scheduled: !!found,
          triggerUsed: test.trigger,
          actualTrigger: found ? found.trigger : null,
          success: !!found
        };

        results.push(result);
        console.log(`🧪 Test ${i + 1} result:`, result);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Test ${i + 1} failed:`, error);
        results.push({
          testName: test.name,
          error: error.message,
          success: false
        });
      }
    }

    setTestResults(results);
    setLoading(false);

    // Show summary
    const successful = results.filter(r => r.success).length;
    Alert.alert(
      'Test Complete!',
      `${successful}/${results.length} trigger formats worked.\n\nCheck the results below and console logs for details.\n\nWorking formats will show "✅ Scheduled" and should fire in ~1 minute.`
    );
  };

  // Clear all test notifications
  const clearTestNotifications = async () => {
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      let cleared = 0;

      for (const notification of allScheduled) {
        if (notification.content.title?.includes('🧪 Test')) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          cleared++;
        }
      }

      Alert.alert('Cleared!', `Removed ${cleared} test notifications.`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Check current scheduled notifications
  const checkScheduled = async () => {
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📊 Current scheduled notifications:', allScheduled.length);
      
      allScheduled.forEach((notif, index) => {
        console.log(`📊 ${index + 1}. ${notif.content.title}`);
        console.log(`     ID: ${notif.identifier}`);
        console.log(`     Trigger:`, notif.trigger);
      });

      Alert.alert(
        'Scheduled Check',
        `Found ${allScheduled.length} scheduled notifications.\n\nCheck console for details.`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      margin: 20,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: '#F59E0B',
      maxHeight: 600,
    }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#F59E0B',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          🧪 Trigger Format Diagnostic
        </Text>

        <Text style={{
          fontSize: 12,
          color: '#6B7280',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          This will test 6 different notification trigger formats to find which one actually works in your environment.
        </Text>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#F59E0B',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={testTriggerFormats}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              🧪 Run All Trigger Tests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#6B7280',
              padding: 8,
              borderRadius: 6,
            }}
            onPress={checkScheduled}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 12 }}>
              📊 Check Scheduled Count
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#EF4444',
              padding: 8,
              borderRadius: 6,
            }}
            onPress={clearTestNotifications}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 12 }}>
              🗑️ Clear Test Notifications
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={{
            backgroundColor: '#F8FAFC',
            padding: 12,
            borderRadius: 8,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Test Results:
            </Text>
            
            {testResults.map((result, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: result.success ? '#ECFDF5' : '#FEF2F2',
                  padding: 8,
                  borderRadius: 6,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: result.success ? '#D1FAE5' : '#FECACA',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: result.success ? '#047857' : '#DC2626',
                  marginBottom: 4,
                }}>
                  {result.success ? '✅' : '❌'} Test {index + 1}: {result.testName}
                </Text>
                
                {result.success ? (
                  <>
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>
                      Status: Scheduled successfully
                    </Text>
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>
                      ID: {result.notificationId?.slice(0, 12)}...
                    </Text>
                    {result.actualTrigger && (
                      <Text style={{ fontSize: 10, color: '#6B7280' }}>
                        Trigger: {JSON.stringify(result.actualTrigger)}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={{ fontSize: 10, color: '#DC2626' }}>
                    Error: {result.error || 'Not scheduled'}
                  </Text>
                )}
              </View>
            ))}

            <Text style={{
              fontSize: 10,
              color: '#9CA3AF',
              textAlign: 'center',
              marginTop: 8,
              fontStyle: 'italic',
            }}>
              Working formats should fire in ~1 minute.{'\n'}
              Watch for notifications to test timing accuracy.
            </Text>
          </View>
        )}

        {loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
          }}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={{ marginTop: 8, color: '#6B7280' }}>
              Running trigger tests...
            </Text>
          </View>
        )}

        <Text style={{
          fontSize: 10,
          color: '#9CA3AF',
          textAlign: 'center',
          marginTop: 16,
          fontStyle: 'italic',
        }}>
          Diagnostic Tool - Remove in production{'\n'}
          This will help identify which trigger format works
        </Text>
      </ScrollView>
    </View>
  );
}