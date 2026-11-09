import { View, Pressable, StyleSheet, Text } from 'react-native'

import { colors, radius, spacing } from '../theme'

type Props<T extends string> = {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedButtons<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.group}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface },
  segment: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  selected: { backgroundColor: colors.primary },
  label: { color: colors.muted },
  selectedLabel: { color: colors.text }
})
