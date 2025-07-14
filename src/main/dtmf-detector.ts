import * as fs from 'fs';
import audioDecode from 'audio-decode';
import Goertzel from 'goertzeljs';

// Define the DTMF frequencies
const DTMF_FREQUENCIES = {
  low: [697, 770, 852, 941],
  high: [1209, 1336, 1477, 1633],
};

// Map frequency pairs to DTMF digits/characters
const DTMF_TONES: Record<string, string> = {
  '697-1209': '1',
  '697-1336': '2',
  '697-1477': '3',
  '770-1209': '4',
  '770-1336': '5',
  '770-1477': '6',
  '852-1209': '7',
  '852-1336': '8',
  '852-1477': '9',
  '941-1209': '*',
  '941-1336': '0',
  '941-1477': '#',
};

type DetectedTone = {
  tone: string;
  timestamp: number;
};

async function detectDtmf(filePath: string): Promise<DetectedTone[] | null> {
  try {
    // 1. Read the audio file buffer
    const audioBuffer = fs.readFileSync(filePath);

    // 2. Decode the audio buffer into raw audio data
    const audioData = (await audioDecode(audioBuffer)) as unknown as {
      sampleRate: number;
      length: number;
      channelData: Float32Array[];
    };
    const { sampleRate, channelData } = audioData;

    // Use the first channel for analysis (assuming mono or taking the first of a stereo file)
    const samples = channelData[0];

    // Define analysis parameters
    const chunkSize = Math.floor(sampleRate * 0.05); // 50ms chunks
    const hopSize = Math.floor(sampleRate * 0.025); // 25ms overlap for smoother detection
    const detectedTones: DetectedTone[] = [];
    let lastDetectedTone: string | null = null;
    let lastDetectedTimestamp = 0;

    // 3. Process audio in chunks
    for (let i = 0; i < samples.length; i += hopSize) {
      const chunk = samples.slice(i, i + chunkSize);
      if (chunk.length < chunkSize) continue;

      // Calculate timestamp in seconds
      const timestamp = Number((i / sampleRate).toFixed(3));

      // 4. Perform frequency analysis using Goertzel algorithm
      const goertzel = new Goertzel({
        frequencies: [...DTMF_FREQUENCIES.low, ...DTMF_FREQUENCIES.high],
        sampleRate: sampleRate,
      });

      chunk.forEach((sample: number) => goertzel.processSample(sample));

      const energies: Record<number, number> = goertzel.energies;

      // Find the two most dominant frequencies (one from low, one from high group)
      let lowFreq: number | undefined, highFreq: number | undefined;
      let lowEnergy = 0,
        highEnergy = 0;

      DTMF_FREQUENCIES.low.forEach((freq) => {
        if (energies[freq] > lowEnergy) {
          lowEnergy = energies[freq];
          lowFreq = freq;
        }
      });

      DTMF_FREQUENCIES.high.forEach((freq) => {
        if (energies[freq] > highEnergy) {
          highEnergy = energies[freq];
          highFreq = freq;
        }
      });

      // Simple threshold to filter out noise
      const THRESHOLD = 0.005;

      // 5. Check if a DTMF tone is found
      if (
        lowFreq !== undefined &&
        highFreq !== undefined &&
        lowEnergy > THRESHOLD &&
        highEnergy > THRESHOLD
      ) {
        const toneKey = `${lowFreq}-${highFreq}`;
        const detectedTone = DTMF_TONES[toneKey];

        // Only log if it's a new tone or if enough time has passed to consider it a new event
        if (
          detectedTone &&
          (detectedTone !== lastDetectedTone ||
            timestamp - lastDetectedTimestamp > 0.1)
        ) {
          console.log(
            `Detected DTMF tone: '${detectedTone}' at timestamp: ${timestamp}s`
          );
          lastDetectedTone = detectedTone;
          lastDetectedTimestamp = timestamp;
          detectedTones.push({
            tone: detectedTone,
            timestamp: timestamp,
          });
        }
      } else {
        // Reset last detected tone when silence is found
        lastDetectedTone = null;
      }
    }

    return detectedTones;
  } catch (error) {
    console.error('Error processing audio file:', error);
    return null;
  }
}

// Check for command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide the path to an audio file as an argument.');
  console.error('Usage: ts-node dtmf-detector.ts <path_to_audio_file>');
  process.exit(1);
}

// Run the function
detectDtmf(filePath).then((results) => {
  if (results && results.length > 0) {
    console.log('\n--- Detection Summary ---');
    results.forEach((result) => {
      console.log(`Tone: '${result.tone}' | Timestamp: ${result.timestamp}s`);
    });
  } else if (results) {
    console.log('\nNo DTMF tones found in the file.');
  }
});
