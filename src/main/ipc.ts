import { ipcMain, app } from 'electron';
import { loadFileDialogAsync, saveFileDialogAsync } from './menu';
import { mkdir, writeFile, readFile, access, rm } from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { theMainWindow } from '.';
import { buildFromCacheAsync, spawnFfmpegAsync } from './spawn-ffmpeg';

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

export const cacheDir = path.join(app.getPath('userData'), 'stim-cache');

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
    return await spawnFfmpegAsync(args);
  });

  ipcMain.handle(
    'buildFromCache',
    async (_event, stimFiles: string[], outputFilename: string) => {
      console.log(`>>>>> main got 'buildFromCache'`);
      const outputFullPathname = await saveFileDialogAsync(outputFilename);
      return await buildFromCacheAsync(stimFiles, outputFullPathname);
    }
  );

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
      return filePath;
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
