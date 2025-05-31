export enum AudioKey {
  PCM = 'PCM', // Not working
  AAC = 'AAC', // Tone clipping (with or without re-encoding)
  MP3 = 'MP3', // Works only with re-encoding assembled audio -- should be faster than opus
  OPUS = 'OPUS', // Works only with re-encoding of assembled audio -- durations more precise than mp3
}
export const CHOSEN_AUDIO_KEY = AudioKey.OPUS;

export const TONE_DURATION_MS = 200; // Duration in milliseconds (divisible by 20)
