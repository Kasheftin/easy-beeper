// Renders a Beep[] configuration into a WAV file (16-bit mono PCM).
//
// Why render instead of scheduling timers: a pre-rendered track is played by the
// audio hardware clock, so beeps never drift, never jitter, and keep going in the
// background as long as the audio player is alive. The JS thread does nothing
// while the track plays.

import type { Beep } from './model';
import { synthesize } from './synth';

/** 8 kHz is plenty for beeps up to ~3.5 kHz and keeps the file small (16 KB/s). */
export const SAMPLE_RATE = 8000;

/** The rendered track is at least this long, then looped. */
const MIN_TRACK_SECONDS = 300;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/**
 * Track length in seconds: a multiple of every interval (so the loop point keeps
 * all beeps aligned) that is at least MIN_TRACK_SECONDS long.
 */
export function trackSeconds(beeps: Beep[]): number {
  const period = beeps.reduce((acc, b) => lcm(acc, Math.max(1, Math.round(b.interval))), 1);
  return period * Math.ceil(MIN_TRACK_SECONDS / period);
}

/** Perceptual-ish volume curve: 100 -> 1.0, 50 -> 0.25, 0 -> silent. */
function gain(volume: number): number {
  const v = Math.min(100, Math.max(0, volume)) / 100;
  return v * v;
}

export function renderPcm(beeps: Beep[], seconds: number, sampleRate = SAMPLE_RATE): Int16Array {
  const total = seconds * sampleRate;
  const mix = new Float32Array(total);
  const cache = new Map<string, Float32Array>();

  for (const beep of beeps) {
    const interval = Math.max(1, Math.round(beep.interval));
    const at = ((Math.round(beep.at) % interval) + interval) % interval;
    const g = gain(beep.volume);
    if (g === 0) continue;

    let sample = cache.get(beep.sound);
    if (!sample) {
      sample = synthesize(beep.sound, sampleRate);
      cache.set(beep.sound, sample);
    }

    for (let t = at; t < seconds; t += interval) {
      const start = t * sampleRate;
      const n = Math.min(sample.length, total - start);
      for (let i = 0; i < n; i++) mix[start + i] += sample[i] * g;
    }
  }

  const pcm = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    const s = Math.max(-1, Math.min(1, mix[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm;
}

/** Wraps PCM samples in a 44-byte RIFF/WAVE header. */
export function toWav(pcm: Int16Array, sampleRate = SAMPLE_RATE): Uint8Array {
  const dataBytes = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  ascii(36, 'data');
  view.setUint32(40, dataBytes, true);

  new Int16Array(buffer, 44).set(pcm);
  return new Uint8Array(buffer);
}

export function renderWav(beeps: Beep[]): { wav: Uint8Array; seconds: number } {
  const seconds = trackSeconds(beeps);
  return { wav: toWav(renderPcm(beeps, seconds)), seconds };
}
