/*
  Extend Stimulus class with Electron-specific methods.
  We do this in separate file so a simple ts-node
  program can import Stimulus without problems.

  This file must be imported in addition to Stimulus.ts only when
  any of these additional methods are used.
*/
import { Stimulus } from './Stimulus';
import { Encoder } from '../Encoder';
import { DisplayKey, displays } from '../../../displays';
import { TONE_DURATION_MS } from '../../../constants';
import { stableStringify } from '../utilities';

// Extend the interface
declare module './Stimulus' {
  interface Stimulus {
    encode(encoder: Encoder): void;
    saveToCacheAsync(displayKey: DisplayKey): Promise<void>;
  }
}

Stimulus.prototype.encode = function (encoder: Encoder): void {
  const nFrames = Math.round((this.durationMs / 1000) * encoder.fps);
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
  this._audioCacheFilename = await window.electron.ensureAudioCacheAsync(
    // Leave room for two half tones: one for the start and one for the end
    this.durationMs - TONE_DURATION_MS
  );
  const displayProps = displays[displayKey];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { meta, _cachedFilename, ...filteredProps } = this; // Exclude props that don't affect encoding
  const unhashedFilename =
    `${displayProps.width}x${displayProps.height}-${displayProps.fps}` +
    stableStringify(filteredProps) + // Excludes private props
    '.mp4';
  this._cachedFilename = await window.electron.isCachedAsync(unhashedFilename);
  if (this._cachedFilename) {
    console.log('>>>>> Stim already cached');
    return; // Nothing more to do
  }
  const encoder = new Encoder(displayKey);
  this.encode(encoder);
  try {
    const path = await window.electron.saveBufferToCacheAsync(
      await encoder.getBufferAsync(),
      unhashedFilename
    );
    console.log('>>>>> Stim cached at:', path);
    this._cachedFilename = path;
  } catch (error) {
    throw new Error('Caching stim failed: ' + error);
  }
};
