import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { stimsCacheDir, ensureCacheDirAsync } from './ipc';
import { writeFile as writeFileAsync } from 'fs/promises';
import * as path from 'path';
import { PEAK_OFFSET_MS } from '../../tools/generate-tones';
import { DisplayKey, displays } from '../displays';

export async function spawnFfmpegAsync(args: string[]): Promise<string> {
  const startTime = new Date().getTime();
  return new Promise<string>((resolve, reject) => {
    if (!ffmpegPath) {
      reject('ffmpegPath not found');
      return;
    }

    console.log(`>>>>> cd ${stimsCacheDir}\n>>>>> ffmpeg ` + args.join(' '));
    const ffmpegProcess = spawn(ffmpegPath, args, { cwd: stimsCacheDir });

    let stdOutput: string = '';
    let errorOutput: string = '';

    ffmpegProcess.stdout.on('data', (data) => {
      stdOutput += data.toString();
      console.log('>>>>> ffmpeg output:', data.toString());
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      /*
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
  startTimes: number[],
  outputPath: string
): Promise<string> {
  const displayProps = displays[displayKey];
  await ensureCacheDirAsync();
  // TODO: make unique name to allow more than one call to ffmpeg
  const inputListFilename: string = 'input-list.txt';
  const fileList: string = inputFilenames
    .map((name) => `file '${name}'`)
    .join('\n');
  await writeFileAsync(
    path.join(stimsCacheDir, inputListFilename),
    fileList,
    'utf-8'
  );

  const audioFilename = await generateAudioFile(startTimes);
  /* prettier-ignore */
  const args = [
    //'-i', audioFilename,
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', inputListFilename,
    '-i', audioFilename,
    '-c', 'copy', // copy the streams directly without re-encoding
    '-r', displayProps.fps.toString(),
    '-vsync', 'cfr', // Constant frame rate
    // '-bsf:v', 'h264_mp4toannexb',
    '-y', // Force overwrite and avoid y/N prompt
    outputPath,
  ];
  //args = ['-version'];
  return await spawnFfmpegAsync(args);
}

// Returns name of generated audio file
async function generateAudioFile(startTimes: number[]): Promise<string> {
  const filterComplexFilename = path.join(stimsCacheDir, 'filter-complex.txt');
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
  await writeFileAsync(filterComplexFilename, filterComplex.join('\n'));
  console.log(`>>>>> filterComplex written to ${filterComplexFilename}`);

  const AUDIO_FILENAME = 'audio.m4a'; //.m4a for aac
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
