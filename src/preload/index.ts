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
  runFfmpeg: (args: string[]) => {
    return ipcRenderer.invoke('runFfmpeg', args);
  },
  buildFromCacheAsync: (
    stimFilenames: string[],
    startTimes: number[],
    outputFilename: string
  ): Promise<string> => {
    return ipcRenderer.invoke(
      'buildFromCacheAsync',
      stimFilenames,
      startTimes,
      outputFilename
    );
  },
  saveBufferToCache: (buffer: ArrayBuffer, filename: string) => {
    return ipcRenderer.invoke('saveBufferToCache', buffer, filename);
  },
  readFromCache: (filename: string) => {
    return ipcRenderer.invoke('readFromCache', filename);
  },
  isCached: (filename: string) => {
    return ipcRenderer.invoke('isCached', filename);
  },
});
