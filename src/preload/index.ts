/* eslint-disable @typescript-eslint/no-explicit-any */

// Preload scripts contain code that executes in a renderer
// process before its web content begins loading. These scripts
// run within the renderer context, but have access to Node.js APIs.
//
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  runFfmpegAsync: (args: string[]) => {
    return ipcRenderer.invoke('runFfmpeg', args);
  },

  showSaveDialogAsync: (
    options: Electron.SaveDialogOptions
  ): Promise<Electron.SaveDialogReturnValue> =>
    ipcRenderer.invoke('showSaveDialog', options),

  buildFromCacheAsync: (
    stimVideoFilenames: string[],
    durations: number[],
    outputFullPathname: string,
    title?: string,
    description?: string
  ): Promise<string> => {
    return ipcRenderer.invoke(
      'buildFromCache',
      stimVideoFilenames,
      durations,
      outputFullPathname,
      title,
      description
    );
  },

  ensureSilentCacheAsync: (durationMs: number): Promise<string> => {
    // Returns full path of silence file
    return ipcRenderer.invoke('ensureSilentCache', durationMs);
  },

  saveBufferToCacheAsync: (buffer: ArrayBuffer, unhashedFilename: string) => {
    return ipcRenderer.invoke('saveBufferToCache', buffer, unhashedFilename);
  },

  addSubtitleAsync: (filename: string, durationMs: number, text: string) => {
    return ipcRenderer.invoke('addSubtitle', filename, durationMs, text);
  },

  readFromCacheAsync: (filename: string) => {
    return ipcRenderer.invoke('readFromCache', filename);
  },

  isCachedAsync: (unhashedFilename: string) => {
    // Returns filename (without full path)
    return ipcRenderer.invoke('isCached', unhashedFilename);
  },

  getAppVersionAsync: () => {
    return ipcRenderer.invoke('getAppVersion');
  },

  // Prompts user to select a directory and returns an array of image paths,
  // starting with the directory path
  scanImagesInDirectoryAsync: () => ipcRenderer.invoke('scanImagesInDirectory'),
});
