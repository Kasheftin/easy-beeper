import { StyleSheet, View } from 'react-native'

import type { Beep } from '../model'
import { SOUND_NAMES } from '../synth'
import { colors, radius, spacing } from '../theme'
import { IconButton } from './IconButton'
import { LabeledSlider } from './LabeledSlider'
import { SegmentedButtons } from './SegmentedButtons'
import { playPreview } from '../preview'

export const MAX_INTERVAL = 30

type Props = {
  beep: Beep
  onChange: (patch: Partial<Beep>) => void
  onRemove: () => void
}

export function BeepCard({ beep, onChange, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.sounds}>
          <SegmentedButtons
            options={SOUND_NAMES}
            value={beep.sound}
            onChange={(sound) => {
              onChange({ sound })
              playPreview(sound, beep.volume)
            }}
          />
        </View>
        <IconButton icon="trash-can-outline" size={24} variant="danger" onPress={onRemove} />
      </View>

      <LabeledSlider
        label="Every"
        value={beep.interval}
        min={1}
        max={MAX_INTERVAL}
        format={(v) => `${v} s`}
        // `at` must stay inside [0, interval): clamp it whenever the interval shrinks.
        onChange={(interval) => onChange({ interval, at: Math.min(beep.at, interval - 1) })}
      />

      <LabeledSlider
        label="At second"
        value={beep.at}
        min={0}
        max={Math.max(0, beep.interval - 1)}
        format={(v) => `${v} of ${beep.interval}`}
        onChange={(at) => onChange({ at })}
      />

      <LabeledSlider
        label="Volume"
        value={beep.volume}
        min={0}
        max={100}
        step={5}
        format={(v) => `${v}%`}
        onChange={(volume) => onChange({ volume })}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sounds: { flex: 1 },
})
