import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from './ui';
import { COLORS, HABIT_CATEGORIES, HABIT_DIFFICULTIES, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';
import apiService from '../services/api';
import notificationService from '../services/notifications';

interface Habit {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  color: string;
  reminderTime?: string;
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  isArchived: boolean;
}

interface HabitActionsProps {
  habit: Habit;
  onUpdate: () => void;
  onDelete: () => void;
}

export const HabitActions: React.FC<HabitActionsProps> = ({
  habit,
  onUpdate,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    name: habit.name,
    description: habit.description,
    category: habit.category,
    difficulty: habit.difficulty,
    color: habit.color,
    reminderTime: habit.reminderTime || '',
  });

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleArchive = async () => {
    setShowMenu(false);
    
    Alert.alert(
      habit.isArchived ? 'Unarchive Habit' : 'Archive Habit',
      habit.isArchived 
        ? 'This will move the habit back to your active list.'
        : 'This will hide the habit from your daily list but keep your progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: habit.isArchived ? 'Unarchive' : 'Archive',
          onPress: async () => {
            try {
              await apiService.archiveHabit(habit._id, !habit.isArchived);
              onUpdate();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to archive habit');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    
    try {
      await apiService.deleteHabit(habit._id);
      await notificationService.cancelHabitReminder(habit._id);
      onDelete();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete habit');
    } finally {
      setLoading(false);
    }
  };

  const deleteButtonStyle: ViewStyle = {
    ...styles.deleteButton,
    backgroundColor: COLORS.error,
  };

  const saveEdit = async () => {
    if (!editData.name.trim()) {
      Alert.alert('Error', 'Habit name is required');
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        ...editData,
        reminderTime: editData.reminderTime || undefined,
      };

      await apiService.updateHabit(habit._id, updatePayload);
      
      // Update notifications if reminder time changed
      if (editData.reminderTime !== habit.reminderTime) {
        await notificationService.cancelHabitReminder(habit._id);
        if (editData.reminderTime) {
          await notificationService.scheduleHabitReminder(
            habit._id,
            editData.name,
            editData.reminderTime
          );
        }
      }

      setShowEditModal(false);
      onUpdate();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Action Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>Edit Habit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Ionicons 
                name={habit.isArchived ? "folder-outline" : "archive-outline"} 
                size={20} 
                color={COLORS.textPrimary} 
              />
              <Text style={styles.menuItemText}>
                {habit.isArchived ? 'Unarchive' : 'Archive'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.deleteItem]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, styles.deleteText]}>Delete Habit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editContainer}>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editTitle}>Edit Habit</Text>
            <TouchableOpacity onPress={saveEdit} disabled={loading}>
              <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editContent}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                placeholder="Habit name"
                maxLength={100}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.description}
                onChangeText={(text) => setEditData({ ...editData, description: text })}
                placeholder="Optional description"
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Reminder Time Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reminder Time</Text>
              <TextInput
                style={styles.input}
                value={editData.reminderTime}
                onChangeText={(text) => setEditData({ ...editData, reminderTime: text })}
                placeholder="e.g., 07:30"
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>Format: HH:MM (24-hour format)</Text>
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionsGrid}>
                {HABIT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.option,
                      editData.category === cat.id && styles.optionSelected,
                      editData.category === cat.id && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setEditData({ ...editData, category: cat.id })}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={editData.category === cat.id ? COLORS.textLight : cat.color}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        editData.category === cat.id && styles.optionTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Difficulty Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {HABIT_DIFFICULTIES.map((diff) => (
                  <TouchableOpacity
                    key={diff.id}
                    style={[
                      styles.difficultyOption,
                      editData.difficulty === diff.id && styles.difficultySelected,
                      editData.difficulty === diff.id && { backgroundColor: diff.color },
                    ]}
                    onPress={() => setEditData({ ...editData, difficulty: diff.id })}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        editData.difficulty === diff.id && styles.difficultyTextSelected,
                      ]}
                    >
                      {diff.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.habitColors.map((colorOption) => (
                  <TouchableOpacity
                    key={colorOption}
                    style={[
                      styles.colorOption,
                      { backgroundColor: colorOption },
                      editData.color === colorOption && styles.colorSelected,
                    ]}
                    onPress={() => setEditData({ ...editData, color: colorOption })}
                  >
                    {editData.color === colorOption && (
                      <Ionicons name="checkmark" size={16} color={COLORS.textLight} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Delete Habit</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete "{habit.name}"? This action cannot be undone and will remove all your progress.
            </Text>
            <View style={styles.deleteActions}>
              <Button
                title="Cancel"
                onPress={() => setShowDeleteConfirm(false)}
                variant="outline"
                style={styles.deleteButton}
              />
              <Button
                title="Delete"
                onPress={confirmDelete}
                style={deleteButtonStyle}
                loading={loading}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 200,
    paddingVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
  },
  menuItemText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.base,
  },
  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
    paddingTop: SPACING.base,
  },
  deleteText: {
    color: COLORS.error,
  },
  editContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelButton: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  editTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  editContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: SPACING.base,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.base,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  optionSelected: {
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.textLight,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.base,
    paddingVertical: SPACING.base,
    alignItems: 'center',
  },
  difficultySelected: {
    borderColor: 'transparent',
  },
  difficultyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  difficultyTextSelected: {
    color: COLORS.textLight,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
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
  colorSelected: {
    borderColor: COLORS.textPrimary,
  },
  deleteModal: {
    margin: SPACING.lg,
    padding: SPACING.lg,
  },
  deleteTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.base,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: SPACING.base,
  },
  deleteButton: {
    flex: 1,
  },
});