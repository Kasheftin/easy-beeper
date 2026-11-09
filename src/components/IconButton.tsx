import { Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, radius, spacing } from '../theme'

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  onPress: () => void
  variant?: 'primary' | 'danger' | 'neutral'
  size?: number
};

export function IconButton({ icon, onPress, variant = 'neutral', size = 48 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name={icon} size={size} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { padding: spacing.md, borderRadius: radius.pill },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  neutral: { backgroundColor: colors.muted },
  pressed: { opacity: 0.7 }
})
