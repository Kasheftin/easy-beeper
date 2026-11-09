import z from 'zod'
import Storage from 'expo-sqlite/kv-store'

import { BeepSchema, DEFAULT_BEEPS } from './model'

export const ThemeNameSchema = z.enum(['system', 'light', 'dark'])

export const SettingsSchema = z.object({
  version: z.literal(1),
  beeps: z.array(BeepSchema).min(1).default(DEFAULT_BEEPS),
  theme: ThemeNameSchema.default('system')
})

export type Settings = z.infer<typeof SettingsSchema>
export type ThemeMode = Settings['theme']

export const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({ version: 1 })

const KEY = 'settings'

export function loadSettings(): Settings {
  const raw = Storage.getItemSync(KEY)
  if (!raw) return DEFAULT_SETTINGS
  try {
    const result = SettingsSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings) {
  Storage.setItemSync(KEY, JSON.stringify(settings))
}
