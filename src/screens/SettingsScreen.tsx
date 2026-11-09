import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { BeepCard } from '../components/BeepCard'
import { IconButton } from '../components/IconButton'
import { BeepSchema, type Beep } from '../model'
import { useSettings } from '../settingsContext'
import { colors, font, spacing } from '../theme'

// The screen edits a local draft and commits it to settings only when leaving.
// Rows carry an id so React can keep list items stable across add/remove.
type DraftBeep = Beep & { id: number }

let nextId = 1
const toDraft = (beep: Beep): DraftBeep => ({ ...beep, id: nextId++ })

const NEW_BEEP: Beep = { sound: 'tick', interval: 5, at: 0, volume: 80 }

export default function SettingsScreen() {
  const navigation = useNavigation()
  const { settings, updateSettings } = useSettings()
  const [draft, setDraft] = useState<DraftBeep[]>(() => settings.beeps.map(toDraft))

  // Commit on any way of leaving: header back, Android back gesture, goBack().
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      const beeps = draft
        .map(({ id: _id, ...beep }) => BeepSchema.safeParse(beep))
        .filter((r) => r.success)
        .map((r) => r.data)
      if (beeps.length > 0) updateSettings({ beeps })
    })
  }, [navigation, draft, updateSettings])

  const updateRow = (id: number, patch: Partial<Beep>) =>
    setDraft((d) => d.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  const removeRow = (id: number) => setDraft((d) => d.filter((row) => row.id !== id))
  const addRow = () => setDraft((d) => [...d, toDraft(NEW_BEEP)])

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {draft.map((beep) => (
        <BeepCard
          key={beep.id}
          beep={beep}
          onChange={(patch) => updateRow(beep.id, patch)}
          onRemove={() => removeRow(beep.id)}
        />
      ))}

      {draft.length === 0 ? <Text style={styles.empty}>No beeps. Add one below.</Text> : null}

      <View style={styles.footer}>
        <IconButton icon="plus" variant="primary" onPress={addRow} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  empty: { color: colors.muted, fontSize: font.sm, textAlign: 'center', padding: spacing.lg },
  footer: { alignItems: 'center', paddingTop: spacing.sm },
})
