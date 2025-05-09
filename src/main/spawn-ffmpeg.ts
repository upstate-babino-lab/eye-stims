import { spawn } from 'child_process';
import ffmpegPathStatic from 'ffmpeg-static';
import {
  stimsCacheDir,
  ensureCacheDirAsync,
  silentBasename,
  ensureSilentFileAsync,
} from './ipc';
import { writeFile as writeFileAsync } from 'fs/promises';
import * as path from 'path';
import { audioChoices, AudioProps, toneBasename } from './generate-tones';
import { DisplayKey, displays } from '../displays';
import {
  PEAK_OFFSET_MS,
  TONE_DURATION_MS,
  AudioKey,
  CHOSEN_AUDIO_KEY,
} from '../constants';
import { getStartTimes } from '../shared-utils';
import { app } from 'electron';

if (!ffmpegPathStatic) {
  throw new Error('FFmpeg path is not defined');
}
const ffmpegPath = app.isPackaged
  ? ffmpegPathStatic.replace('app.asar', 'app.asar.unpacked')
  : ffmpegPathStatic;
console.log('>>>>> FFmpeg executable path:', ffmpegPath);

export async function spawnFfmpegAsync(args: string[]): Promise<string> {
  const startTime = new Date().getTime();
  return new Promise<string>((resolve, reject) => {
    if (!ffmpegPath) {
      reject('ffmpegPath not found');
      return;
    }
    args.push('-y'); // Don't wait for user input
    console.log(`>>>>> cd '${stimsCacheDir}'\n>>>>> ffmpeg ` + args.join(' '));
    const ffmpegProcess = spawn(ffmpegPath, args, { cwd: stimsCacheDir });

    let stdOutput: string = '';
    ffmpegProcess.stdout.on('data', (data) => {
      stdOutput += data.toString();
      console.log('>>>>> ffmpeg output:', data.toString());
    });

    let errorOutput: string = '';
    ffmpegProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      /*
      errorOutput += dataStr;
      if (!dataStr.includes('Auto-inserting h264_mp4toannexb bitstream filter')) {
        console.error('ffmpeg stderr:', data.toString());
      }
      errorOutput += dataStr;
      */
      errorOutput = dataStr; // Ignoring all but last stderr for now
    });

    ffmpegProcess.on('close', (code) => {
      // console.error('ffmpeg stderr:', errorOutput);
      const elapsedTime = new Date().getTime() - startTime;
      console.error(
        `>>>>> ffmpeg exited after ${(elapsedTime / 1000).toFixed(2)} seconds =` +
          `${(elapsedTime / 60000).toFixed(2)} minutes ` +
          `with code=${code} stdOutput=${stdOutput} stdOutput.length=${stdOutput.length}`
      );

      if (code === 0) {
        resolve(stdOutput || 'Success');
      } else {
        reject(`ffmpeg exited with error code ${code}: ${errorOutput}`);
      }
    });
  });
}

export async function buildFromCacheAsync(
  displayKey: DisplayKey,
  inputFilenames: string[],
  durations: number[],
  outputPath: string,
  audioKey: AudioKey = CHOSEN_AUDIO_KEY // TODO: Choose from GUI
  //reEncodeAudio: boolean,
): Promise<string> {
  const displayProps = displays[displayKey];
  const audioProps = audioChoices[audioKey];
  await ensureCacheDirAsync();
  // TODO: uuid name to allow more than one call to ffmpeg (e.g. for multiple displays)
  const vInputListFilename: string = 'v-input-list.txt';
  const fileList: string = inputFilenames
    .map((name) => `file '${name}'`)
    .join('\n');
  await writeFileAsync(
    path.join(stimsCacheDir, vInputListFilename),
    fileList,
    'utf-8'
  );

  const audioFilename = await assembleAudioFile(durations, audioProps);
  /* prettier-ignore */
  const args = [
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', vInputListFilename,
    '-i', audioFilename,
    '-map', '0:v',
    '-map', '1:a',
    '-c:v', 'copy', // copy directly without re-encoding to go faster
    '-copyts',
    '-r', displayProps.fps.toString(), // Video framerate
    //'-vsync', 'cfr', // Constant frame rate
    // '-bsf:v', 'h264_mp4toannexb',
  ];
  args.push(outputPath);
  return await spawnFfmpegAsync(args);
}

// FAST way to assemble audio file from segments (but tones can get clipped)
async function assembleAudioFile(
  durationsMs: number[],
  audioProps: AudioProps,
  reEncodeAudio: boolean = true // Slower but prevents tone clipping
): Promise<string> {
  // TODO: uuid name to allow more than one call to ffmpeg (e.g. for multiple displays)
  const inputListFilename: string = 'a-input-list.txt';

  const silentDurations = durationsMs.map((dMs) => dMs - TONE_DURATION_MS);
  silentDurations[0] += PEAK_OFFSET_MS; // First stim does not start with tone
  await ensureSilentFileAsync(silentDurations[0]); // In case it was not created

  // All audio files must use same encoding
  const fileList: string = silentDurations
    .map(
      (dMs, index) =>
        `file '${silentBasename(dMs) + audioProps.fileExtension}'\n` +
        `file '${toneBasename((index + 1) % 10) + audioProps.fileExtension}'`
    )
    .join('\n');

  await writeFileAsync(
    path.join(stimsCacheDir, inputListFilename),
    fileList,
    'utf-8'
  );

  const AUDIO_FILENAME = 'audio' + audioProps.fileExtension; // Should be uuid??
  /* prettier-ignore */
  const args = [
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', inputListFilename,
  ].concat(audioProps.ffEncode);
  if (!reEncodeAudio) {
    args.push('-c');
    args.push('copy'); // copy the streams directly without re-encoding
    args.push('-copyts');
  }
  args.push(AUDIO_FILENAME);

  await spawnFfmpegAsync(args);
  return AUDIO_FILENAME;
}

// SLOW way to generate audio file from scratch
// @ts-ignore: TS6133
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateAudioFile(
  durationsMs: number[],
  audioProps: AudioProps
): Promise<string> {
  const filterComplexFilename = 'filter-complex.txt';
  const FILTER_PRE1 = '[mixed]';
  const FILTER_OUTPUT = '[left_stereo]'; //'[boosted]';

  // Create delayed audio instances
  const startTimes = getStartTimes(durationsMs);
  const filterComplex: string[] = startTimes
    .filter((st) => st >= 0.1)
    .map((st, i) => {
      const delay = Math.round(st * 1000) - PEAK_OFFSET_MS; // Center/peak of tone offset
      return `[0:a] adelay=${delay}|${delay} [a${i}];`;
    });

  // Mix all delayed instances together
  const amixInputs = Array.from(
    { length: filterComplex.length },
    (_, i) => `[a${i}]`
  ).join('');
  filterComplex.push(
    `${amixInputs} amix=inputs=${filterComplex.length} ${FILTER_PRE1};`
  );
  filterComplex.push(
    // Left channel boosted, right channel silenced
    `${FILTER_PRE1}pan=stereo|FL=4.5*c0+0.0*c1|FR=0.0*c0+0.0*c1${FILTER_OUTPUT};`
  );

  // Write filter complex to a text file
  const filterComplexPathname = path.join(stimsCacheDir, filterComplexFilename);
  await writeFileAsync(filterComplexPathname, filterComplex.join('\n'));
  console.log(`>>>>> filterComplex written to ${filterComplexPathname}`);

  const AUDIO_FILENAME = `audio.${audioProps.fileExtension}`; // Should be uuid??
  /* prettier-ignore */
  const args = [
    '-i', 'dtmf-0.wav',
    '-filter_complex_script', filterComplexFilename,
    '-map', FILTER_OUTPUT,
    '-c:a', 'aac', // 'libmp3lame', // 'libopus',
    '-y',
    AUDIO_FILENAME,
  ];
  await spawnFfmpegAsync(args);
  return AUDIO_FILENAME;
}
