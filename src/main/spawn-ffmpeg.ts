import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import {
  stimsCacheDir,
  ensureCacheDirAsync,
  silentFilename,
  ensureSilentFileAsync,
} from './ipc';
import { writeFile as writeFileAsync } from 'fs/promises';
import * as path from 'path';
import { DisplayKey, displays } from '../displays';
import { PEAK_OFFSET_MS, TONE_DURATION_MS } from '../constants';
import { AUDIO_EXT, toneFilename } from './generate-tones';

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
      errorOutput += dataStr;
      /*
      if (!dataStr.includes('Auto-inserting h264_mp4toannexb bitstream filter')) {
        console.error('ffmpeg stderr:', data.toString());
      }
      errorOutput += dataStr;
      */
      //errorOutput = dataStr; // Ignoring all but last stderr for now
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
  outputPath: string
): Promise<string> {
  const displayProps = displays[displayKey];
  await ensureCacheDirAsync();
  // TODO: uuid name to allow more than one call to ffmpeg (e.g. for multiple displays)
  const inputListFilename: string = 'v-input-list.txt';
  const fileList: string = inputFilenames
    .map((name) => `file '${name}'`)
    .join('\n');
  await writeFileAsync(
    path.join(stimsCacheDir, inputListFilename),
    fileList,
    'utf-8'
  );

  const audioFilename = await generateAudioFileNew(durations);
  /* prettier-ignore */
  const args = [
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', inputListFilename,
    '-i', audioFilename,
    '-c', 'copy', // copy the streams directly without re-encoding
    '-r', displayProps.fps.toString(),
    //'-vsync', 'cfr', // Constant frame rate
    // '-bsf:v', 'h264_mp4toannexb',
    '-y', // Force overwrite and avoid y/N prompt
    outputPath,
  ];
  //args = ['-version'];
  return await spawnFfmpegAsync(args);
}

// Returns name of generated audio file  // Should be uuid??
async function generateAudioFileNew(durationsMs: number[]): Promise<string> {
  const AUDIO_FILENAME = `audio.${AUDIO_EXT}`;

  // TODO: uuid name to allow more than one call to ffmpeg (e.g. for multiple displays)
  const inputListFilename: string = 'a-input-list.txt';

  const silentDurations = durationsMs.map((dMs) => dMs - TONE_DURATION_MS);
  silentDurations[0] += PEAK_OFFSET_MS; // First stim does not start with tone
  await ensureSilentFileAsync(silentDurations[0]); // In case it was not created

  const fileList: string =
    silentDurations
      .map(
        (dMs, index) =>
          `file '${silentFilename(dMs)}'\nfile '${toneFilename((index + 1) % 10)}'`
      )
      .join('\n') + '\n';

  await writeFileAsync(
    path.join(stimsCacheDir, inputListFilename),
    fileList,
    'utf-8'
  );

  // All audio files must use same encoding

  /* prettier-ignore */
  const args = [
      '-f', 'concat',
      '-safe', '0', // Allows relative or absolute paths in the input list
      '-i', inputListFilename,
      '-c', 'copy', // copy the streams directly without re-encoding
      // '-copyts',
      // '-vsync', 'cfr', // Constant frame rate
      AUDIO_FILENAME,
    ];
  await spawnFfmpegAsync(args);
  return AUDIO_FILENAME;
}

/*
// Returns name of generated audio file
async function generateAudioFileOld(startTimes: number[]): Promise<string> {
  const filterComplexFilename = 'filter-complex.txt';
  const FILTER_PRE1 = '[mixed]';
  const FILTER_OUTPUT = '[left_stereo]'; //'[boosted]';

  // Create delayed audio instances
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

  const AUDIO_FILENAME = 'audio.m4a'; //.m4a for aac
   prettier-ignore
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
*/
