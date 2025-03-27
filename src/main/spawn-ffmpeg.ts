import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { cacheDir } from './ipc';
import { writeFile } from 'fs/promises';
import * as path from 'path';

export async function spawnFfmpegAsync(args: string[]) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject('ffmpegPath not found');
      return;
    }

    const ffmpegProcess = spawn(ffmpegPath, args);

    let output: string = '';
    let errorOutput: string = '';

    ffmpegProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('>>>>> ffmpeg output:', data.toString());
    });

    ffmpegProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('ffmpeg error:', data.toString());
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(`ffmpeg exited with code ${code}: ${errorOutput}`);
      }
    });
  });
}

export async function buildFromCache(
  inputFilenames: string[],
  outputFilename: string
) {
  const fileListFilename: string = path.join(cacheDir, 'input-list.txt');
  const fileList: string = inputFilenames
    .map((name) => `file '${name}'`)
    .join('\n');
  await writeFile(fileListFilename, fileList, 'utf-8');
  /* prettier-ignore */
  const args = [
    '-f', 'concat',
    '-safe', '0', // Allows using absolute paths in the input-list.txt file
    '-i', fileListFilename,
    //'-c', 'copy', // copy the streams directly, avoiding re-encoding
    '-y', // Force overwrite and avoid y/N prompt
    outputFilename,
  ]
  console.log(`>>>>> ffmpeg ` + args.join(' '));
  await spawnFfmpegAsync(args);
  return outputFilename;
}
