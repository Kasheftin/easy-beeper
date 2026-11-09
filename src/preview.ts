import { createAudioPlayer, type AudioPlayer } from 'expo-audio'
import { File, Paths } from 'expo-file-system'

import type { SoundName } from './model'
import { renderPcm, toWav } from './render'

let player: AudioPlayer | null = null

export function playPreview(sound: SoundName, volume: number) {
  // One file per sound+volume; rendered once, then reused.
  const file = new File(Paths.cache, `preview-${sound}-${volume}.wav`)
  if (!file.exists) {
    const pcm = renderPcm([{ sound, interval: 1, at: 0, volume }], 1)
    file.create()
    file.write(toWav(pcm))
  }

  if (!player) {
    player = createAudioPlayer({ uri: file.uri })
  } else {
    player.replace({ uri: file.uri })
  }
  player.seekTo(0)
  player.play()
}
