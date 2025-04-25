import { DisplayKey } from '@renderer/displays';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ElectronAPI {
  process: any;
  send: (channel: string, data?: any) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  runFfmpeg: (args: string[]) => Promise<string>;
  buildFromCacheAsync: (
    displayKey: DisplayKey,
    stimFilenames: string[],
    durations: number[],
    outputFilename: string
  ) => Promise<string>;
  showSaveDialogAsync: (
    options: Electron.SaveDialogOptions
  ) => Promise<Electron.SaveDialogReturnValue>;
  saveBufferToCacheAsync: (
    buffer: ArrayBuffer,
    filename: string
  ) => Promise<string>;
  ensureSilentCacheAsync: (durationMs: number) => Promise<string>;
  readFromCache: (filename: string) => Promise<ArrayBuffer>;
  isCachedAsync: (unhashedFilename: string) => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
