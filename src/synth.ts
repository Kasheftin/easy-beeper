// Built-in sounds, synthesized in code so the app has no audio assets at all.
// Each sound is a Float32Array of samples in [-1, 1] at the given sample rate.

import { SoundNameSchema, type SoundName } from './model';

const TWO_PI = Math.PI * 2;

/** Short linear attack, exponential-ish release. Keeps beeps click-free. */
function envelope(i: number, n: number, attack: number, release: number): number {
  if (i < attack) return i / attack;
  if (i > n - release) return (n - i) / release;
  return 1;
}

function sine(sampleRate: number, seconds: number, freq: number): Float32Array {
  const n = Math.round(sampleRate * seconds);
  const out = new Float32Array(n);
  const attack = sampleRate * 0.003;
  const release = sampleRate * 0.02;
  for (let i = 0; i < n; i++) {
    out[i] = Math.sin((TWO_PI * freq * i) / sampleRate) * envelope(i, n, attack, release);
  }
  return out;
}

/** Frequency sweep from f0 to f1. */
function chirp(sampleRate: number, seconds: number, f0: number, f1: number): Float32Array {
  const n = Math.round(sampleRate * seconds);
  const out = new Float32Array(n);
  const attack = sampleRate * 0.003;
  const release = sampleRate * 0.02;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const f = f0 + ((f1 - f0) * i) / n;
    phase += (TWO_PI * f) / sampleRate;
    out[i] = Math.sin(phase) * envelope(i, n, attack, release);
  }
  return out;
}

/** Woodblock-ish: low sine with a fast exponential decay. */
function wood(sampleRate: number, seconds: number, freq: number): Float32Array {
  const n = Math.round(sampleRate * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    out[i] = Math.sin(TWO_PI * freq * t) * Math.exp(-t * 40) * envelope(i, n, 8, 8);
  }
  return out;
}

export function synthesize(name: SoundName, sampleRate: number): Float32Array {
  switch (name) {
    case 'tick':
      return sine(sampleRate, 0.06, 1000);
    case 'tone':
      return sine(sampleRate, 0.3, 660);
    case 'chirp':
      return chirp(sampleRate, 0.15, 800, 1400);
    case 'wood':
      return wood(sampleRate, 0.12, 420);
  }
}

export const SOUND_NAMES = SoundNameSchema.options
