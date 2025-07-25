/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ElectronAPI {
  process: any;
  send: (channel: string, data?: any) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  runFfmpeg: (args: string[]) => Promise<string>;
  buildFromCacheAsync: (
    stimVideoFilenames: string[],
    durations: number[],
    outputFilename: string,
    title?: string,
    description?: string
  ) => Promise<string>;
  showSaveDialogAsync: (
    options: Electron.SaveDialogOptions
  ) => Promise<Electron.SaveDialogReturnValue>;
  saveBufferToCacheAsync: (
    buffer: ArrayBuffer,
    filename: string
  ) => Promise<string>;
  addSubtitleAsync: (
    filename: string,
    durationMs: number,
    text: string
  ) => Promise<string>;
  ensureSilentCacheAsync: (durationMs: number) => Promise<string>;
  readFromCache: (filename: string) => Promise<ArrayBuffer>;
  isCachedAsync: (unhashedFilename: string) => Promise<string>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
