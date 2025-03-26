import { ipcMain, BrowserWindow } from 'electron';
import { loadFileDialogAsync } from './menu';
import * as fs from 'fs';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.on('load-file', () => {
    console.log(`>>>>> main got 'load-file'`);
    loadFileDialogAsync(mainWindow).catch((err) => {
      console.log('ERROR from loadFileDialogAsync(): ' + err);
    });
  });

  ipcMain.on('save-file', (_, { filePath, content }) => {
    console.log(`>>>>> main got 'save-file'`);
    fs.writeFile(filePath, content, 'utf-8', (err) => {
      if (err) console.error('Error saving file:', err);
    });
  });

  ipcMain.handle('run-ffmpeg', async (_event, args: string[]) => {
    console.log(`>>>>> main got 'run-ffmpeg'`);
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
}
