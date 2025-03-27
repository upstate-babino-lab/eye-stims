/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ElectronAPI {
  process: any;
  send: (channel: string, data?: any) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  runFfmpeg: (args: string[]) => Promise<string>;
  buildFromCache: (
    stimFilenames: string[],
    outputFilename: string
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
