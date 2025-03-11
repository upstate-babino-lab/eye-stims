// Preload scripts contain code that executes in a renderer
// process before its web content begins loading. These scripts
// run within the renderer context, but have access to Node.js APIs.
//
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer } from 'electron';
import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

ipcRenderer.on('file-loaded', (_, data) => {
  console.log(`>>>>> renderer preload got 'file-loaded'`);
  (document.getElementById('file-content') as HTMLTextAreaElement).value = data;
});

ipcRenderer.on('request-save-file', (_, filePath) => {
  console.log(`>>>>> renderer preload got 'request-save-file'`);
  const content = (document.getElementById('file-content') as HTMLTextAreaElement)
    .value;
  ipcRenderer.send('save-file', { filePath, content });
});
