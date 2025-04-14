/*
  Extend Stimulus class with Electron-specific methods.
  We do this in separate file so a simple ts-node
  program can import Stimulus without problems.

  This file must be imported in addition to Stimulus.ts when
  any of these additional methods are used.
*/
import { Stimulus } from './Stimulus';
import { Encoder } from '../Encoder';
import { DisplayKey, displays } from '../../../displays';
import { stableStringify } from '../utilities';

// Extend the interface
declare module './Stimulus' {
  interface Stimulus {
    encode(encoder: Encoder): void;
    saveToCacheAsync(displayKey: DisplayKey): void;
  }
}

Stimulus.prototype.encode = function (encoder: Encoder): void {
  const nFrames = this.duration * encoder.fps;
  for (let iFrame = 0; iFrame < nFrames; iFrame++) {
    const age = iFrame && iFrame / encoder.fps;
    this.renderFrame(encoder.ctx, age);
    encoder.encodeOneFrame();
  }
};

Stimulus.prototype.saveToCacheAsync = async function (displayKey: DisplayKey) {
  if (!window?.electron) {
    console.error('>>>>> saveToCacheAsync() called without electron');
    return;
  }
  const displayProps = displays[displayKey];
  const unhashedFilename =
    `${displayProps.width}x${displayProps.height}-${displayProps.fps}` +
    stableStringify(this) +
    '.mp4';
  this._cachedFilename = await window.electron.isCached(unhashedFilename);
  if (this._cachedFilename) {
    console.log('>>>>> Stim already cached');
    return; // Nothing more to do
  }
  const encoder = new Encoder(displayKey);
  this.encode(encoder);
  try {
    const path = await window.electron.saveBufferToCache(
      await encoder.getBufferAsync(),
      unhashedFilename
    );
    console.log('>>>>> Stim cached at:', path);
    this._cachedFilename = path;
  } catch (error) {
    throw new Error('Caching stim failed: ' + error);
  }
};
