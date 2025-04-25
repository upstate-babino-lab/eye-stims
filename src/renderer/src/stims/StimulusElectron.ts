/*
  Extend Stimulus class with Electron-specific methods.
  We do this in separate file so a simple ts-node
  program can import Stimulus without including these methods.

  This file must be imported in addition to Stimulus.ts only when
  any of these additional methods are used.
*/
import { Stimulus } from './Stimulus';
import { Encoder } from '../Encoder';
import { DisplayKey, displays } from '../../../displays';
import { TONE_DURATION_MS } from '../../../constants';
import { stableStringify } from '../render-utils';

// Extend the interface
declare module './Stimulus' {
  interface Stimulus {
    encode(encoder: Encoder): void;
    cacheStimVideoAsync(displayKey: DisplayKey): Promise<void>;
  }
}

Stimulus.prototype.encode = function (encoder: Encoder): void {
  const nFrames = Math.round((this.durationMs / 1000) * encoder.displayProps.fps);
  for (let iFrame = 0; iFrame < nFrames; iFrame++) {
    const age = iFrame && iFrame / encoder.displayProps.fps;
    this.renderFrame(encoder.ctx, encoder.displayProps.pxPerDegree, age);
    encoder.encodeOneFrame();
  }
};

Stimulus.prototype.cacheStimVideoAsync = async function (displayKey: DisplayKey) {
  if (!window?.electron) {
    console.error('>>>>> saveToCacheAsync() called without Electron');
    return;
  }
  const displayProps = displays[displayKey];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { meta, _videoCacheFilename: _cachedFilename, ...filteredProps } = this; // Exclude props that don't affect encoding
  const unhashedFilename =
    `${displayProps.width}x${displayProps.height}-${displayProps.fps}` +
    stableStringify(filteredProps) + // Excludes private props
    '.mp4';
  [this._videoCacheFilename, this._silentCacheFilename] = await Promise.all([
    await window.electron.isCachedAsync(unhashedFilename),
    await window.electron.ensureSilentCacheAsync(
      // Leave room for two half tones: one for the start and one for the end
      this.durationMs - TONE_DURATION_MS
    ),
  ]);
  if (this._videoCacheFilename && this._silentCacheFilename) {
    console.log('>>>>> Stim already cached');
    return; // Nothing more to do
  }
  const encoder = new Encoder(displayKey);
  this.encode(encoder);
  try {
    const videoBuffer = await encoder.getBufferAsync();
    const path = await window.electron.saveBufferToCacheAsync(
      videoBuffer,
      unhashedFilename
    );
    console.log('>>>>> Stim cached at:', path);
    this._videoCacheFilename = path;
  } catch (error) {
    throw new Error('Caching stim failed: ' + error);
  }
};
