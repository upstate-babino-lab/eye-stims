import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { cacheDir, ensureCacheDirAsync } from './ipc';
import { writeFile as writeFileAsync } from 'fs/promises';
import * as path from 'path';
import { PEAK_OFFSET_MS } from '../../tools/generate-tones';

export async function spawnFfmpegAsync(args: string[]) {
  const startTime = new Date().getTime();
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject('ffmpegPath not found');
      return;
    }

    console.log(`>>>>> cd ${cacheDir}\n>>>>> ffmpeg ` + args.join(' '));
    const ffmpegProcess = spawn(ffmpegPath, args, { cwd: cacheDir });

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
          `with code=${code} stdOutput=${stdOutput}`
      );
      if (code === 0) {
        resolve(stdOutput);
      } else {
        reject(`ffmpeg exited with error code ${code}: ${errorOutput}`);
      }
    });
  });
}

export async function buildFromCacheAsync(
  inputFilenames: string[],
  startTimes: number[],
  outputFilename: string
) {
  await ensureCacheDirAsync();
  // TODO: make unique name to allow more than one call to ffmpeg
  const inputListFilename: string = 'input-list.txt';
  const fileList: string = inputFilenames
    .map((name) => `file '${name}'`)
    .join('\n');
  await writeFileAsync(path.join(cacheDir, inputListFilename), fileList, 'utf-8');

  const audioFilename = await generateAudioFile(startTimes);
  /* prettier-ignore */
  const args = [
    //'-i', audioFilename,
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', inputListFilename,
    '-i', audioFilename,
    '-c', 'copy', // copy the streams directly without re-encoding
    '-r', '30', // TODO: use fps parameter
    '-vsync', 'cfr', // Constant frame rate
    // '-bsf:v', 'h264_mp4toannexb',
    '-y', // Force overwrite and avoid y/N prompt
    outputFilename,
  ];
  //args = ['-version'];
  await spawnFfmpegAsync(args);
}

// Returns name of generated audio file
async function generateAudioFile(startTimes: number[]): Promise<string> {
  const filterComplexFilename = path.join(cacheDir, 'filter-complex.txt');
  const audioFilename = 'audio.mp4';

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
  filterComplex.push(`${amixInputs} amix=inputs=${filterComplex.length} [mixed];`);
  filterComplex.push(
    '[mixed]pan=stereo|FL=1.0*c0+0.0*c1|FR=0.0*c0+0.0*c1[left_stereo]'
  );

  // Write filter complex to a text file
  await writeFileAsync(filterComplexFilename, filterComplex.join('\n'));
  console.log(`>>>>> filterComplex written to ${filterComplexFilename}`);

  /* prettier-ignore */
  const args = [
      '-i', 'dtmf-0.wav',
      '-filter_complex_script', filterComplexFilename,
      '-map', '[left_stereo]',
      '-c:a', 'libmp3lame', // 'libopus',
      '-y', 
      audioFilename,
    ];
  await spawnFfmpegAsync(args);
  return audioFilename;
}
