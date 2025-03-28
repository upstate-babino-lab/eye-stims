import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { cacheDir } from './ipc';
import { writeFile } from 'fs/promises';
import * as path from 'path';

export async function spawnFfmpegAsync(args: string[]) {
  const startTime = new Date().getTime();
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
          `with code=${code} output=${output}`
      );
      if (code === 0) {
        resolve(output);
      } else {
        reject(`ffmpeg exited with error code ${code}: ${errorOutput}`);
      }
    });
  });
}

export async function buildFromCacheAsync(
  inputFilenames: string[],
  outputFilename: string
): Promise<string> {
  // TODO: make unique name to allow more than one call to ffmpeg
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
    '-c', 'copy', // copy the streams directly without re-encoding
    //'-r', '30',
    // '-bsf:v', 'h264_mp4toannexb',
    '-y', // Force overwrite and avoid y/N prompt
    outputFilename,
  ]
  console.log(`>>>>> ffmpeg ` + args.join(' '));
  await spawnFfmpegAsync(args);
  return outputFilename;
}
