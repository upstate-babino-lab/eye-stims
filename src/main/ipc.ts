import { ipcMain, app } from 'electron';
import { loadFileDialogAsync } from './menu';
import { mkdir, writeFile, readFile, access, rm } from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { theMainWindow } from '.';

// Generate filename that's guaranteed to be valid on Windows, and of limited length.
function hashFilename(unhashedFilename: string): string {
  const extension = path.extname(unhashedFilename);
  const filename =
    crypto
      .createHash('sha256')
      .update(unhashedFilename)
      .digest('hex')
      .slice(0, 20) + extension;
  return filename;
}

const cacheDir = path.join(app.getPath('userData'), 'stim-cache');

// Ensure the cache directory exists
const ensureCacheDir = async () => {
  await mkdir(cacheDir, { recursive: true });
};

export async function clearStimCacheAsync() {
  console.log('>>>>> removing ' + cacheDir);
  await rm(cacheDir, { recursive: true, force: true });
}

export function setupIpcHandlers() {
  ipcMain.on('loadFile', () => {
    console.log(`>>>>> main got 'loadFile'`);
    loadFileDialogAsync(theMainWindow).catch((err) => {
      console.log('ERROR from loadFileDialogAsync(): ' + err);
    });
  });

  ipcMain.on('saveFile', (_, { filePath, content }) => {
    console.log(`>>>>> main got 'saveFile'`);
    fs.writeFile(filePath, content, 'utf-8', (err) => {
      if (err) console.error('Error saving file:', err);
    });
  });

  ipcMain.handle('runFfmpeg', async (_event, args: string[]) => {
    console.log(`>>>>> main got 'runFfmpeg'`);
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
  });

  // Save buffer to cache
  ipcMain.handle(
    'saveBufferToCache',
    async (_event, buffer: ArrayBuffer, unhashedFilename: string) => {
      // console.log(`>>>>> main got 'saveBufferToCache'`);
      try {
        await ensureCacheDir();
        const filePath: string = path.join(
          cacheDir,
          hashFilename(unhashedFilename)
        );
        console.log(`>>>>> filePath=${filePath}`);
        await writeFile(filePath, Buffer.from(buffer));
        return filePath; // Return saved file path
      } catch (error) {
        console.error('Error saving buffer:', error);
        throw error;
      }
    }
  );

  // Test if file exists in cache
  ipcMain.handle('isCached', async (_event, unhashedFilename: string) => {
    // console.log(`>>>>> main got 'isCached'`);
    try {
      const filePath = path.join(cacheDir, hashFilename(unhashedFilename));
      await access(filePath); // Throws if file doesn't exist
      return true;
    } catch {
      return false;
    }
  });

  // Read buffer from cache
  ipcMain.handle('readFromCache', async (_event, unhashedFilename: string) => {
    // console.log(`>>>>> main got 'readFromCache'`);
    try {
      const filePath = path.join(cacheDir, hashFilename(unhashedFilename));
      const data = await readFile(filePath);
      return data.buffer; // Return as ArrayBuffer
    } catch (error) {
      console.error('Error reading from cache:', error);
      throw error;
    }
  });
}
