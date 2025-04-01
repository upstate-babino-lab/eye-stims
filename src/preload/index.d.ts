import { DisplayKey } from "@renderer/displays";

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
    startTimes: number[],
    suggestedFilename: string
  ) => Promise<string>;
  saveBufferToCache: (buffer: ArrayBuffer, filename: string) => Promise<string>;
  readFromCache: (filename: string) => Promise<ArrayBuffer>;
  isCached: (filename: string) => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
