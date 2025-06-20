import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

// Button Component
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary': return styles.buttonSecondary;
      case 'outline': return styles.buttonOutline;
      case 'ghost': return styles.buttonGhost;
      default: return styles.buttonPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return styles.buttonSmall;
      case 'large': return styles.buttonLarge;
      default: return styles.buttonMedium;
    }
  };

  const getTextVariantStyle = () => {
    switch (variant) {
      case 'secondary': return styles.buttonTextSecondary;
      case 'outline': return styles.buttonTextOutline;
      case 'ghost': return styles.buttonTextGhost;
      default: return styles.buttonTextPrimary;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small': return styles.buttonTextSmall;
      case 'large': return styles.buttonTextLarge;
      default: return styles.buttonTextMedium;
    }
  };

  const buttonStyle = [
    styles.button,
    getVariantStyle(),
    getSizeStyle(),
    disabled && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    getTextVariantStyle(),
    getTextSizeStyle(),
    disabled && styles.buttonTextDisabled,
    textStyle,
  ];

  const getIconColor = () => {
    switch (variant) {
      case 'secondary': return COLORS.textPrimary;
      case 'outline': return COLORS.primary;
      case 'ghost': return COLORS.primary;
      default: return COLORS.textLight;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.textLight : COLORS.primary}
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={getIconColor()}
              style={styles.buttonIcon}
            />
          )}
          <Text style={buttonTextStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = SPACING.base,
  shadow = true,
}) => {
  return (
    <View style={[styles.card, shadow && styles.cardShadow, { padding }, style]}>
      {children}
    </View>
  );
};

// EmptyState Component
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-outline',
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description && <Text style={styles.emptyStateDescription}>{description}</Text>}
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          variant="outline"
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );
};

// LoadingSpinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
};

// Badge Component
interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success': return styles.badgeSuccess;
      case 'warning': return styles.badgeWarning;
      case 'error': return styles.badgeError;
      case 'info': return styles.badgeInfo;
      default: return styles.badgeDefault;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return styles.badgeSmall;
      default: return styles.badgeMedium;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small': return styles.badgeTextSmall;
      default: return styles.badgeTextMedium;
    }
  };

  const badgeStyle = [
    styles.badge,
    getVariantStyle(),
    getSizeStyle(),
  ];

  const badgeTextStyle = [
    styles.badgeText,
    getTextSizeStyle(),
  ];

  return (
    <View style={badgeStyle}>
      <Text style={badgeTextStyle}>{text}</Text>
    </View>
  );
};

// Divider Component
interface DividerProps {
  margin?: number;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({
  margin = SPACING.base,
  color = COLORS.border,
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          marginVertical: margin,
        },
      ]}
    />
  );
};

// ProgressBar Component
interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = COLORS.borderLight,
  progressColor = COLORS.primary,
  showPercentage = false,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressBar,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressText}>{percentage}%</Text>
      )}
    </View>
  );
};

// Chip Component
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  color = COLORS.primary,
  icon,
}) => {
  const chipStyle = [
    styles.chip,
    selected && [styles.chipSelected, { backgroundColor: color }],
  ];

  const chipTextStyle = [
    styles.chipText,
    selected && styles.chipTextSelected,
  ];

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={selected ? COLORS.textLight : color}
          style={styles.chipIcon}
        />
      )}
      <Text style={chipTextStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSmall: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: COLORS.textLight,
  },
  buttonTextSecondary: {
    color: COLORS.textPrimary,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextGhost: {
    color: COLORS.primary,
  },
  buttonTextSmall: {
    fontSize: FONT_SIZES.sm,
  },
  buttonTextMedium: {
    fontSize: FONT_SIZES.base,
  },
  buttonTextLarge: {
    fontSize: FONT_SIZES.lg,
  },
  buttonTextDisabled: {
    opacity: 0.6,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // EmptyState Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    marginTop: SPACING.base,
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },

  // Badge Styles
  badge: {
    borderRadius: BORDER_RADIUS.base,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeDefault: {
    backgroundColor: COLORS.secondary,
  },
  badgeSuccess: {
    backgroundColor: COLORS.success,
  },
  badgeWarning: {
    backgroundColor: COLORS.warning,
  },
  badgeError: {
    backgroundColor: COLORS.error,
  },
  badgeInfo: {
    backgroundColor: COLORS.info,
  },
  badgeSmall: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontWeight: '600',
    color: COLORS.textLight,
  },
  badgeTextSmall: {
    fontSize: FONT_SIZES.xs,
  },
  badgeTextMedium: {
    fontSize: FONT_SIZES.sm,
  },

  // Divider Styles
  divider: {
    height: 1,
  },

  // ProgressBar Styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    minWidth: 40,
    textAlign: 'right',
  },

  // Chip Styles
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  chipSelected: {
    borderColor: 'transparent',
  },
  chipIcon: {
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  chipTextSelected: {
    color: COLORS.textLight,
  },
});