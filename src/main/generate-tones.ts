#!/usr/bin/env ts-node
// Make sure ts-node is installed
// $ npm install -g ts-node

// To visualize waveform:
// $ audiowaveform -z 30 -i dtmf-0.wav -o dtmf-0.png && xdg-open dtmf-0.png

import * as fs from 'fs';
import * as wav from 'node-wav';
import * as path from 'path';
import { TONE_DURATION_MS } from '../constants';
import { spawnFfmpegAsync } from './spawn-ffmpeg';

type DTMF = { tone: string; f1: number; f2: number };
// DTMF frequencies (Hz) and tone names
const dtmfTones: DTMF[] = [
  { tone: '1', f1: 697, f2: 1209 },
  { tone: '2', f1: 697, f2: 1336 },
  { tone: '3', f1: 697, f2: 1477 },
  { tone: 'A', f1: 697, f2: 1633 },
  { tone: '4', f1: 770, f2: 1209 },
  { tone: '5', f1: 770, f2: 1336 },
  { tone: '6', f1: 770, f2: 1477 },
  { tone: 'B', f1: 770, f2: 1633 },
  { tone: '7', f1: 852, f2: 1209 },
  { tone: '8', f1: 852, f2: 1336 },
  { tone: '9', f1: 852, f2: 1477 },
  { tone: 'C', f1: 852, f2: 1633 },
  { tone: 'x', f1: 941, f2: 1209 }, // Because '*' is not valid filename character in Windows
  { tone: '0', f1: 941, f2: 1336 },
  { tone: '#', f1: 941, f2: 1477 },
  { tone: 'D', f1: 941, f2: 1633 },
];

function toneFilename(toneObj: DTMF) {
  return [`dtmf-${toneObj.tone}.wav`, `dtmf-${toneObj.tone}-left.m4a`];
}
export function toneFilenames(): string[] {
  return dtmfTones.map((tObj: DTMF) => toneFilename(tObj)).flat();
}
export const SAMPLE_RATE = 44100; // Samples per second
export const PEAK_OFFSET_MS = TONE_DURATION_MS / 2;
const numSamples = (SAMPLE_RATE * TONE_DURATION_MS) / 1000;

function generateDTMFSineWave(frequency1: number, frequency2: number): number[] {
  const samples: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const time = i / SAMPLE_RATE;
    const sample =
      Math.sin(2 * Math.PI * frequency1 * time) +
      Math.sin(2 * Math.PI * frequency2 * time);
    samples.push(sample);
  }
  // Scale amplitude up and down to peak in the center.
  // Goal is for post-processing of recording to precisely locate
  // the peak amplitude by finding the centerpoint of region that
  // exceeds threshold amplitude.
  // We use a sine wave to the power 4 to create steep ramps with soft start and stop.
  return samples;
}

async function createWavFileAsync(
  samples: number[],
  filename: string
): Promise<void> {
  // See plot-tone-amplitude.py
  // We want centered peak to be a bit more than 50 milliseconds wide
  // to ensure accurate positioning at any threshold and enough duration
  // to reliably identify the DTMF
  const scaledSamples = samples.map(
    (s, i) => s * 0.5 * Math.sin((i / (samples.length - 1)) * Math.PI) ** 4
  );
  const wavData = wav.encode(
    [scaledSamples], // Single array for mono (not stereo)
    {
      sampleRate: SAMPLE_RATE,
    }
  );
  await fs.promises.writeFile(filename, wavData);
}

export async function generateDTMFWavFilesAsync(
  destinationDirectory: string
): Promise<void> {
  for (const tObj of dtmfTones) {
    const samples = generateDTMFSineWave(tObj.f1, tObj.f2);
    const fullPathname = path.join(destinationDirectory, toneFilename(tObj)[0]);
    await createWavFileAsync(samples, fullPathname);
    console.log(`>>>>> Created ${fullPathname}. Now converting to m4a...`);
    /* prettier-ignore */
    const args = [
      '-i', fullPathname, // Mono input
      '-af', 'pan=stereo|c0=1*FC|c1=0*FC', // Full to left channel
      '-ar', SAMPLE_RATE.toString(),
      '-acodec', 'aac',
      path.join(destinationDirectory, toneFilename(tObj)[1]), // Stereo output
    ];
    await spawnFfmpegAsync(args);
  }
}

// Only when running this script as a standalone
if (require.main === module) {
  generateDTMFWavFilesAsync(__dirname).catch(console.error);
}
