// NotificationDebugComponent.jsx - Enhanced debug component
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from "react-native";
import { useState, useEffect } from "react";
import { notificationService } from '../services/notifications';

export default function NotificationDebugComponent() {
  const [loading, setLoading] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [systemDiagnostic, setSystemDiagnostic] = useState(null);
  const [lastTestResult, setLastTestResult] = useState(null);

  // Load current notification state
  const loadNotificationState = async () => {
    try {
      setLoading(true);
      const notifications = await notificationService.getScheduledNotifications();
      const settings = await notificationService.getNotificationSettings();
      
      setScheduledNotifications(notifications);
      setNotificationSettings(settings);
    } catch (error) {
      console.error('❌ Error loading notification state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationState();
  }, []);

  // Test immediate notification
  const testImmediateNotification = async () => {
    setLoading(true);
    try {
      const result = await notificationService.sendImmediateNotification(
        '🧪 Immediate Test',
        `Sent at ${new Date().toLocaleTimeString()}. You should see this notification right now!`,
        { type: 'test_immediate', timestamp: new Date().toISOString() }
      );
      
      if (result) {
        Alert.alert('Test Sent! 🎉', 'Check your notification area. Did you see the notification immediately?');
        setLastTestResult({ type: 'immediate', success: true, time: new Date().toLocaleTimeString() });
      } else {
        Alert.alert('Test Failed ❌', 'Could not send immediate notification. Check permissions and logs.');
        setLastTestResult({ type: 'immediate', success: false, time: new Date().toLocaleTimeString() });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      setLastTestResult({ type: 'immediate', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Test scheduled notification (2 minutes from now for better testing)
  const testScheduledNotification = async () => {
    setLoading(true);
    try {
      const result = await notificationService.sendTestScheduledNotification(2);
      
      if (result && result.verified) {
        Alert.alert(
          'Scheduled Successfully! ⏰', 
          `Test notification scheduled for ${result.scheduledTime}.\n\nYou should receive it in exactly 2 minutes.\n\nVerification: ${result.verified ? '✅ Found in system' : '❌ Not found'}`
        );
        setLastTestResult({ 
          type: 'scheduled', 
          success: true, 
          scheduledFor: result.scheduledTime,
          verified: result.verified
        });
      } else {
        Alert.alert('Scheduling Failed ❌', 'Could not schedule test notification or verification failed.');
        setLastTestResult({ type: 'scheduled', success: false });
      }
      
      // Refresh state to show the new scheduled notification
      setTimeout(loadNotificationState, 1000);
    } catch (error) {
      Alert.alert('Error', error.message);
      setLastTestResult({ type: 'scheduled', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Run complete system diagnostic
  const runSystemDiagnostic = async () => {
    setLoading(true);
    try {
      const diagnostic = await notificationService.debugNotificationSystem();
      setSystemDiagnostic(diagnostic);
      
      console.log('🔍 Full diagnostic result:', diagnostic);
      
      const issues = [];
      if (diagnostic.permissions?.status !== 'granted') issues.push('Permissions not granted');
      if (!diagnostic.systemStatus?.initialized) issues.push('Service not initialized');
      if (!diagnostic.systemStatus?.isDevice) issues.push('Running on simulator');
      
      Alert.alert(
        'Diagnostic Complete 🔍',
        issues.length > 0 
          ? `Found ${issues.length} issues:\n• ${issues.join('\n• ')}\n\nCheck console for full details.`
          : 'All systems appear to be working correctly!\n\nCheck console for detailed results.'
      );
      
      await loadNotificationState();
    } catch (error) {
      Alert.alert('Diagnostic Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear all notifications with detailed feedback
  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'This will cancel ALL scheduled notifications and clear storage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await notificationService.cancelAllHabitReminders();
              
              if (result.success) {
                Alert.alert(
                  'Cleanup Complete! 🧹', 
                  `Cancelled ${result.totalCancelled} notifications:\n• ${result.cancelledFromMappings} from stored mappings\n• ${result.cancelledByContent} by content scan\n\nRemaining: ${result.remainingCount}`
                );
              } else {
                Alert.alert('Cleanup Failed', result.error || 'Unknown error occurred');
              }
              
              await loadNotificationState();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Test habit reminder scheduling
  const testHabitScheduling = async () => {
    Alert.alert(
      'Test Habit Scheduling',
      'This will schedule a test habit reminder for 3 minutes from now.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule Test',
          onPress: async () => {
            setLoading(true);
            try {
              const testTime = new Date();
              testTime.setMinutes(testTime.getMinutes() + 3);
              const timeString = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
              
              const testHabit = {
                _id: 'test_habit_' + Date.now(),
                name: 'Test Habit Reminder',
                reminderTime: timeString,
                isActive: true,
                isArchived: false
              };
              
              const result = await notificationService.scheduleHabitReminder(testHabit);
              
              if (result) {
                Alert.alert(
                  'Test Habit Scheduled! 🎯',
                  `Test habit reminder scheduled for ${timeString} (3 minutes from now).\n\nYou should receive a habit reminder notification at that exact time.`
                );
              } else {
                Alert.alert('Test Failed', 'Could not schedule test habit reminder.');
              }
              
              await loadNotificationState();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'granted': return '#10B981';
      case 'denied': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'granted': return '✅';
      case 'denied': return '❌';
      default: return '⚠️';
    }
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      margin: 20,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: '#3B82F6',
      maxHeight: 600, // Prevent the debug panel from taking over the screen
    }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#3B82F6',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          🧪 Notification Debug Panel
        </Text>

        {/* System Status */}
        <View style={{
          backgroundColor: '#F8FAFC',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            System Status:
          </Text>
          
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {getStatusIcon(notificationSettings?.permissions)} Permissions: {notificationSettings?.permissions || 'Loading...'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              📱 Platform: {notificationSettings?.platform || 'Unknown'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              🔧 Service: {notificationSettings?.initialized ? '✅ Ready' : '❌ Not Ready'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              📊 Total Scheduled: {scheduledNotifications.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              🎯 Habit Reminders: {notificationSettings?.habitNotificationCount || 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              💾 Stored Mappings: {notificationSettings?.storedMappings || 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              📱 Device: {notificationSettings?.isDevice ? '✅ Physical' : '❌ Simulator'}
            </Text>
            </View>
        </View>

        {/* Last Test Result */}
        {lastTestResult && (
          <View style={{
            backgroundColor: lastTestResult.success ? '#ECFDF5' : '#FEF2F2',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
              Last Test Result:
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Type: {lastTestResult.type}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Status: {lastTestResult.success ? '✅ Success' : '❌ Failed'}
            </Text>
            {lastTestResult.scheduledFor && (
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                Scheduled for: {lastTestResult.scheduledFor}
              </Text>
            )}
            {lastTestResult.verified !== undefined && (
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                Verified: {lastTestResult.verified ? '✅ Yes' : '❌ No'}
              </Text>
            )}
          </View>
        )}

        {/* Scheduled Notifications List */}
        {scheduledNotifications.length > 0 && (
          <View style={{
            backgroundColor: '#F0FDF4',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Scheduled Notifications ({scheduledNotifications.length}):
            </Text>
            <ScrollView style={{ maxHeight: 100 }}>
              {scheduledNotifications.map((notif, index) => (
                <View key={notif.identifier} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 11, color: '#047857', fontWeight: '500' }}>
                    {index + 1}. {notif.content.title}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#6B7280' }}>
                    ID: {notif.identifier.slice(0, 8)}...
                  </Text>
                  {notif.trigger.hour !== undefined && (
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>
                      Daily at {notif.trigger.hour.toString().padStart(2, '0')}:
                      {notif.trigger.minute.toString().padStart(2, '0')}
                    </Text>
                  )}
                  {notif.trigger.seconds !== undefined && (
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>
                      In {Math.round(notif.trigger.seconds / 60)} minutes
                    </Text>
                  )}
                  <Text style={{ fontSize: 10, color: '#6B7280' }}>
                    Type: {notif.content.data?.type || 'unknown'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Test Buttons */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#10B981',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={testImmediateNotification}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              ⚡ Test Immediate Notification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#3B82F6',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={testScheduledNotification}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              ⏰ Test Scheduled (2 min)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#8B5CF6',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={testHabitScheduling}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              🎯 Test Habit Reminder (3 min)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#F59E0B',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={runSystemDiagnostic}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              🔍 Run Full Diagnostic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#EF4444',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={clearAllNotifications}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              🧹 Clear All Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#6B7280',
              padding: 12,
              borderRadius: 8,
              opacity: loading ? 0.5 : 1,
            }}
            onPress={loadNotificationState}
            disabled={loading}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '500' }}>
              🔄 Refresh Status
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
          }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 8, color: '#6B7280' }}>Testing...</Text>
          </View>
        )}

        <Text style={{
          fontSize: 10,
          color: '#9CA3AF',
          textAlign: 'center',
          marginTop: 16,
          fontStyle: 'italic',
        }}>
          Debug Panel - Remove in production{'\n'}
          Check console logs for detailed output
        </Text>
      </ScrollView>
    </View>
  );
}