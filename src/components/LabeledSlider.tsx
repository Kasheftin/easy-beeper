import Slider from '@react-native-community/slider'
import { StyleSheet, Text, View } from 'react-native'

import { colors, font, spacing } from '../theme'

type Props = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Formats the value shown next to the label, e.g. `(v) => \`${v} s\``. */
  format?: (value: number) => string
  onChange: (value: number) => void
}

export function LabeledSlider({ label, value, min, max, step = 1, format = String, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{format(value)}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.muted}
        thumbTintColor={colors.text}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { color: colors.muted, fontSize: font.sm },
  value: { color: colors.text, fontSize: font.sm, fontVariant: ['tabular-nums'] },
  slider: { width: '100%', height: 40 },
})
