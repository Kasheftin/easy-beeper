// The runtime: renders the track to a file, plays it in a loop with background
// playback enabled, and exposes start/stop plus an elapsed-seconds counter.

import { useCallback, useEffect, useRef, useState } from 'react'
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio'
import { File, Paths } from 'expo-file-system'

import type { Beep } from './model'
import { renderWav } from './render'
import { useTimer } from './useTimer'

export enum BeeperStatus {
    idle = 'idle',
    running = 'running',
    paused = 'paused'
}

export interface BeeperState {
  status: BeeperStatus
  pastSegmentsSum: number
  segmentStartedAt: number
  error: string | null
}

export function useBeeper(beeps: Beep[]) {
  const playerRef = useRef<AudioPlayer | null>(null)
  const [state, setState] = useState<BeeperState>({
    status: BeeperStatus.idle,
    pastSegmentsSum: 0,
    segmentStartedAt: 0,
    error: null
  })

  // Audio session: play in background, never fight other apps for audio focus.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    }).catch((e) => setState((s) => ({ ...s, error: String(e) })))
  }, [])

  const stop = useCallback(() => {
    const player = playerRef.current
    playerRef.current = null
    if (player) {
      try {
        player.pause()
        player.clearLockScreenControls()
        player.remove()
      } catch {
        // already released
      }
    }
    setState(() => ({
      pastSegmentsSum: 0,
      segmentStartedAt: 0,
      status: BeeperStatus.idle,
      error: null
    }))
  }, [])

  const fail = (e: unknown) => { stop(); setState(s => ({ ...s, error: e instanceof Error ? e.message : String(e) })) }

  const play = useCallback(() => {
    try {
      if (state.status === BeeperStatus.idle) {
        const { wav } = renderWav(beeps)
        const file = new File(Paths.cache, 'beeps.wav');
        if (file.exists) {
          file.delete()
        }
        file.create()
        file.write(wav)
        const player = createAudioPlayer({ uri: file.uri })
        player.loop = true
        player.volume = 1
        // Required on Android for sustained background playback: this is what
        // starts expo-audio's foreground service (with the media notification).
        player.setActiveForLockScreen(true, { title: 'Easy Beeper', artist: 'running' })
        player.play()
        playerRef.current = player
        setState(() => ({
          status: BeeperStatus.running,
          pastSegmentsSum: 0,
          segmentStartedAt: Date.now(),
          error: null
        }))
      } else if (state.status === BeeperStatus.paused) {
        const player = playerRef.current;
        if (!player) throw new Error('No player to resume')
        player.play()
        setState((s) => ({
          ...s,
          status: BeeperStatus.running,
          segmentStartedAt: Date.now(),
        }))
      }
    } catch (e) {
      fail(e)
    }
  }, [beeps, state.status])

  const pause = useCallback(() => {
    try {
      const player = playerRef.current
      if (!player) {
        throw new Error('No player to pause')
      }
      player.pause()
      setState((s) => ({
        ...s,
        status: BeeperStatus.paused,
        pastSegmentsSum: s.pastSegmentsSum + (Date.now() - s.segmentStartedAt)
      }))
    } catch (e) {
      fail(e)
    }
  }, [])

  useEffect(() => stop, [stop])

  const now = useTimer()
  const ellapsedMs = state.pastSegmentsSum + (state.status === BeeperStatus.running ? Math.max(0, now - state.segmentStartedAt) : 0)

  return { ...state, play, pause, stop, elapsed: Math.floor(ellapsedMs / 1000) }
}
