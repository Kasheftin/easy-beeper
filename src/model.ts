import z from 'zod'

export const SoundNameSchema = z.enum(['tick', 'tone', 'chirp', 'wood'])

export const BeepSchema = z.object({
  sound: SoundNameSchema,
  interval: z.number().int().min(1),
  at: z.number().int().min(0),
  volume: z.number().min(0).max(100)
}).refine((b) => b.at < b.interval, { message: 'at must be < interval', path: ['at'] })

export type SoundName = z.infer<typeof SoundNameSchema>
export type Beep = z.infer<typeof BeepSchema>

export const DEFAULT_BEEPS: Beep[] = [
  { sound: 'tick', interval: 1, at: 0, volume: 60 },
  { sound: 'tone', interval: 10, at: 0, volume: 100 },
];

/** A beep fires at second `t` when `t % interval === at`. */
export function firesAt(beep: Beep, t: number): boolean {
  return t % beep.interval === beep.at;
}
