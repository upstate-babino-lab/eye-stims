#!/usr/bin/env ts-node
// Make sure ts-node is installed
// $ npm install -g ts-node

// To visualize waveform:
// $ audiowaveform -z 30 -i dtmf-0.wav -o dtmf-0.png && xdg-open dtmf-0.png

import * as fs from 'fs';
import * as wav from 'node-wav';
import * as path from 'path';
import { TONE_DURATION_MS, AudioKey } from '../constants';
import { spawnFfmpegAsync } from './spawn-ffmpeg';

export type AudioProps = {
  sampleRate: number;
  fileExtension: string;
  ffEncode: string[];
};

export const audioChoices: Record<AudioKey, AudioProps> = {
  // Sample rate options: 16000 | 48000 | 44100
  // Bitrate options: 96k | 128k | 192k | 320k
  PCM: {
    // Fixed frame rate and not lossy
    sampleRate: 16000,
    fileExtension: '.wav',
    ffEncode: ['-c:a', 'pcm_s16le'], // No bitrate b/c intrinsic to sampleRate
  },
  AAC: {
    sampleRate: 16000,
    fileExtension: '.m4a',
    ffEncode: ['-c:a', 'aac', '-b:a', '320k'],
  },
  MP3: {
    sampleRate: 44100,
    fileExtension: '.mp3',
    ffEncode: ['-c:a', 'libmp3lame', '-b:a', '320k'],
  },
  OPUS: {
    sampleRate: 48000,
    fileExtension: '.opus',
    // -strict -2 allows experimental codec
    ffEncode: ['-strict', '-2', '-c:a', 'opus', '-b:a', '320k'],
  },
};

type DTMF = { tone: string; f1: number; f2: number };
// DTMF frequencies (Hz) and tone names
const dtmfTones: DTMF[] = [
  { tone: '0', f1: 941, f2: 1336 },
  { tone: '1', f1: 697, f2: 1209 },
  { tone: '2', f1: 697, f2: 1336 },
  { tone: '3', f1: 697, f2: 1477 },
  { tone: '4', f1: 770, f2: 1209 },
  { tone: '5', f1: 770, f2: 1336 },
  { tone: '6', f1: 770, f2: 1477 },
  { tone: '7', f1: 852, f2: 1209 },
  { tone: '8', f1: 852, f2: 1336 },
  { tone: '9', f1: 852, f2: 1477 },

  { tone: 'A', f1: 697, f2: 1633 },
  { tone: 'B', f1: 770, f2: 1633 },
  { tone: 'C', f1: 852, f2: 1633 },
  { tone: 'D', f1: 941, f2: 1633 },
  { tone: 'x', f1: 941, f2: 1209 }, // Because '*' is not valid filename character in Windows
  { tone: '#', f1: 941, f2: 1477 },
];

/*
function toneFilenamePair(toneObj: DTMF, extension: string) {
  return [`dtmf-${toneObj.tone}.wav`, `dtmf-${toneObj.tone}-left.${extension}`];
}
export function toneFilenames(): string[] {
  return dtmfTones.map((tObj: DTMF) => toneFilenamePair(tObj)).flat();
}

export function toneFilename(int: number): string {
  return toneFilenamePair(dtmfTones[int])[1];
}
*/

function generateDTMFSineWave(
  frequency1: number,
  frequency2: number,
  sampleRate: number
): number[] {
  const samples: number[] = [];
  const numSamples = (sampleRate * TONE_DURATION_MS) / 1000;
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
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
  // See plot-tone-amplitude.py

  return samples.map(
    (s, i) => s * 0.5 * Math.sin((i / (samples.length - 1)) * Math.PI) ** 4
  );
}

async function createWavFileAsync(
  samples: number[],
  pathname: string,
  sampleRate: number
): Promise<void> {
  const wavData = wav.encode(
    [samples], // Single array for mono (not stereo)
    {
      sampleRate: sampleRate,
    }
  );
  await fs.promises.writeFile(pathname, wavData);
}

export function toneBasename(tIndex: number): string {
  const basename = 'dtmf-' + dtmfTones[tIndex].tone;
  //console.log('>>>>> basename=' + basename);
  return basename;
}

export async function generateToneFilesAsync(
  destinationDirectory: string,
  audioKey: AudioKey
): Promise<void> {
  const audioProps = audioChoices[audioKey];
  for (const [tIndex, toneObj] of dtmfTones.entries()) {
    const samples = generateDTMFSineWave(
      toneObj.f1,
      toneObj.f2,
      audioProps.sampleRate
    );
    const filenameWithoutExtension = toneBasename(tIndex);
    const fullPathnameWithoutExtension = path.join(
      destinationDirectory,
      filenameWithoutExtension
    );
    const wavFilename = fullPathnameWithoutExtension + '.wav';
    await createWavFileAsync(samples, wavFilename, audioProps.sampleRate);

    if (audioProps.fileExtension !== '.wav') {
      console.log(`>>>>> Created ${wavFilename}. Now encoding to ${audioKey}...`);
      /* prettier-ignore */
      const args = [
        '-i', wavFilename, // Mono input
        '-af', 'pan=stereo|c0=1*FC|c1=0*FC', // Full to left channel
        '-ar', audioProps.sampleRate.toString(),
      ].concat(audioProps.ffEncode);
      args.push(filenameWithoutExtension + audioProps.fileExtension);

      await spawnFfmpegAsync(args);
    }
  }
}

/* Only for running this script as a standalone
if (require.main === module) {
  generateToneFilesAsync(__dirname, (process.argv[3] as AudioKey) || 'PCM')
    .catch(console.error)
    .finally(() => {
      console.log('>>>>> Done generating tones');
    });
}
*/
