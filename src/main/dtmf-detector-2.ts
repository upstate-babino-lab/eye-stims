// src/index.ts
import * as fs from 'fs';
import decodeAudio from 'audio-decode'; // For decoding audio files
import Goertzel from 'goertzeljs'; // The Goertzel algorithm implementation

// Define an interface for the detected DTMF tone
interface DetectedTone {
  digit: string;
  timestamp: number; // in seconds
}

// DTMF Frequencies (Hz)
const DTMF_FREQUENCIES = {
  // Row Frequencies
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  A: [697, 1633],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  B: [770, 1633],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  C: [852, 1633],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
  D: [941, 1633],
};

const THRESHOLD = 0.005; // This threshold will likely need tuning for your audio
const MIN_TONE_DURATION_MS = 50; // Minimum duration a tone must be present to be considered valid
const SAMPLE_WINDOW_MS = 20; // How often to run Goertzel algorithm (e.g., every 20ms of audio)

async function detectDtmfInAudio(audioFilePath: string): Promise<DetectedTone[]> {
  console.log(`Loading audio file: ${audioFilePath}...`);

  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`Audio file not found: ${audioFilePath}`);
  }

  const audioBuffer = fs.readFileSync(audioFilePath);
  console.log('Decoding audio data...');
  const audioData = await decodeAudio(audioBuffer);

  const sampleRate = audioData.sampleRate;
  const channelData = audioData.getChannelData(0); // Get the first channel

  console.log(
    `Audio decoded: Sample Rate = ${sampleRate} Hz, Length = ${audioData.duration.toFixed(2)} seconds`
  );

  const detectedTones: DetectedTone[] = [];
  let lastDetectedDigit: string | null = null;
  let lastDetectionTimestamp: number = 0;

  // Prepare Goertzel detectors for all DTMF frequencies
  const dtmfFrequencyList = Object.values(DTMF_FREQUENCIES).flat();
  const uniqueDtmfFrequencies = Array.from(new Set(dtmfFrequencyList));

  // Determine an appropriate chunk size for the Goertzel algorithm.
  // A larger chunk size gives better frequency resolution but slower time resolution.
  // We'll aim for a chunk that covers at least a few cycles of the lowest frequency (697 Hz).
  // A common approach is a chunk size that corresponds to ~20-50ms of audio.
  const chunkSize = Math.floor(sampleRate * (SAMPLE_WINDOW_MS / 1000)); // samples per chunk

  if (chunkSize === 0) {
    throw new Error(
      `Chunk size is too small for sample rate ${sampleRate} and window ${SAMPLE_WINDOW_MS}ms. Increase SAMPLE_WINDOW_MS.`
    );
  }

  console.log(
    `Using Goertzel chunk size: ${chunkSize} samples (${((chunkSize / sampleRate) * 1000).toFixed(2)} ms)`
  );

  const goertzels: { [key: number]: Goertzel } = {};
  uniqueDtmfFrequencies.forEach((freq) => {
    goertzels[freq] = new Goertzel({
      frequencies: [freq],
      sampleRate: sampleRate,
      chunkSize: chunkSize,
    });
  });

  // Process the audio in chunks
  for (let i = 0; i < channelData.length; i += chunkSize) {
    const chunk = channelData.slice(i, i + chunkSize);
    if (chunk.length < chunkSize) {
      // Handle the last, possibly smaller, chunk
      // Optionally pad with zeros or skip
      break;
    }

    const currentTimestamp = i / sampleRate; // current time in seconds

    const activeFrequencies: number[] = [];

    // Run Goertzel for each DTMF frequency
    uniqueDtmfFrequencies.forEach((freq) => {
      const goertzel = goertzels[freq];
      goertzel.processSamples(chunk); // Use processSamples for a chunk
      const energy = goertzel.energies[freq]; // Get the energy for this specific frequency

      if (energy > THRESHOLD) {
        activeFrequencies.push(freq);
      }
      goertzel.clear(); // Clear for the next chunk
    });

    // Determine the detected DTMF digit
    let currentDigit: string | null = null;
    for (const digit in DTMF_FREQUENCIES) {
      const [freq1, freq2] = DTMF_FREQUENCIES[digit];
      if (activeFrequencies.includes(freq1) && activeFrequencies.includes(freq2)) {
        currentDigit = digit;
        break; // Found a match
      }
    }

    // Logic to debounce and record tones
    if (currentDigit && currentDigit === lastDetectedDigit) {
      // Still detecting the same tone, extend its duration (implicitly by not adding a new entry)
    } else if (currentDigit && currentDigit !== lastDetectedDigit) {
      // New tone detected or first tone
      const timeSinceLastDetection = currentTimestamp - lastDetectionTimestamp;

      // If the last tone was long enough, record it
      if (
        lastDetectedDigit &&
        timeSinceLastLastDetection * 1000 >= MIN_TONE_DURATION_MS
      ) {
        // This is where you would record the end time for the previous tone if needed
        // For simplicity, we just record the start timestamp of a new valid tone.
        // The timestamp recorded for a tone is the timestamp of its *first* detection in a window.
        // A more advanced approach would track start and end times.
      }

      // Record the new tone's start time
      detectedTones.push({ digit: currentDigit, timestamp: currentTimestamp });
      lastDetectedDigit = currentDigit;
      lastDetectionTimestamp = currentTimestamp;
    } else if (!currentDigit && lastDetectedDigit) {
      // Tone has stopped, check its duration
      const timeSinceLastDetection = currentTimestamp - lastDetectionTimestamp;
      if (timeSinceLastDetection * 1000 < MIN_TONE_DURATION_MS) {
        // If the tone was too short, remove the last detected tone (it was a false positive)
        detectedTones.pop();
      }
      lastDetectedDigit = null; // Reset for silence
    }
  }

  // Handle the very last detected tone if it was still active at the end of the audio
  if (lastDetectedDigit) {
    // (Optional) Add a final check here for the last tone's duration if needed.
    // For this example, if it was detected, it's included.
  }

  return detectedTones;
}

// Main execution function
async function main() {
  const audioFile = process.argv[2]; // Get audio file path from command line arguments

  if (!audioFile) {
    console.error('Usage: ts-node src/index.ts <path_to_audio_file>');
    process.exit(1);
  }

  try {
    const tones = await detectDtmfInAudio(audioFile);

    console.log('\n--- Detected DTMF Tones ---');
    if (tones.length === 0) {
      console.log('No DTMF tones detected.');
    } else {
      tones.forEach((toneInfo) => {
        console.log(
          `Timestamp: ${toneInfo.timestamp.toFixed(3)}s, Tone: ${toneInfo.digit}`
        );
      });
    }
  } catch (error: any) {
    console.error(`Program failed: ${error.message}`);
    process.exit(1);
  }
}

// Call the main function
main();
