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

function capitalize(str: string): string {
  if (!str) {
    return str; // Return empty string or null/undefined as is
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function oldStimList2New(old) {
  if (!old || !old.stimulus_list) {
    return null;
  }
  return old.stimulus_list.map((oldItem) => {
    const oldStim = oldItem.stimulus;
    const newStim = {
      name: capitalize(oldStim.stimulusType),
      duration: oldStim.lifespan,
      bgColor: oldStim.backgroundColor,
    };
    return newStim;
  });
}

ipcRenderer.on('file-loaded', (_, parsedContents) => {
  console.log(`>>>>> renderer preload got 'file-loaded'`);
  const stimulusList = oldStimList2New(parsedContents) ?? parsedContents;
  const numberedLines = stimulusList
    .map((object, index) => `${index + 1}: ${JSON.stringify(object)}`) // Add line numbers
    .join('\n'); // Join into a single string with newlines

  (document.getElementById('file-content') as HTMLTextAreaElement).value =
    numberedLines;
});

ipcRenderer.on('request-save-file', (_, filePath) => {
  console.log(`>>>>> renderer preload got 'request-save-file'`);
  const content = (document.getElementById('file-content') as HTMLTextAreaElement)
    .value;
  ipcRenderer.send('save-file', { filePath, content });
});
