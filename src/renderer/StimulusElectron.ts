/*
  Extend Stimulus class with Chromium and Electron-specific methods.
  We do this in separate file so a simple ts-node
  program can import Stimulus without including these methods.

  This file must be imported in addition to Stimulus.ts only when
  any of these additional methods are used.
*/
import { Stimulus } from '@stims/index';
import { Encoder } from '@renderer/Encoder';
import { DisplayKey, displays } from '../displays';
import { TONE_DURATION_MS } from '../constants';
import { stableStringify } from '@renderer/render-utils';

// Extend the interface
declare module '@stims/Stimulus' {
  interface Stimulus {
    encode(encoder: Encoder): void;
    cacheStimVideoAsync(displayKey: DisplayKey): Promise<void>;
  }
}

Stimulus.prototype.encode = function (encoder: Encoder): void {
  const nFrames = Math.round((this.durationMs / 1000) * encoder.displayProps.fps);
  for (let iFrame = 0; iFrame < nFrames; iFrame++) {
    const ageMs = iFrame && (iFrame / encoder.displayProps.fps) * 1000;
    if (ageMs < 0 || ageMs > this.durationMs) {
      // eslint-disable-next-line no-debugger
      debugger; // Should never happen
      continue;
    }
    if (
      (this.headMs && ageMs < this.headMs) ||
      (this.tailMs && ageMs >= this.durationMs - this.tailMs)
    ) {
      encoder.encodeOneFrame(true); // Solid black
      continue;
    }
    // Body frame
    this.renderFrame(
      encoder.ctx,
      encoder.displayProps.pxPerDegree,
      (ageMs - (this.headMs || 0)) / 1000 //  Always start at age 0
    );
    encoder.encodeOneFrame();
  }
};

Stimulus.prototype.cacheStimVideoAsync = async function (displayKey: DisplayKey) {
  if (!window?.electron) {
    console.error('>>>>> cacheStimVideoAsync() requires Electron');
    return;
  }
  const displayProps = displays[displayKey];
  const unhashedFilename =
    `${displayProps.width}x${displayProps.height}-${displayProps.fps}` +
    stableStringify(this) + // Excludes private props
    '.mp4';
  [this._videoCacheFilename, this._silentCacheFilename] = await Promise.all([
    await window.electron.isCachedAsync(unhashedFilename),
    await window.electron.ensureSilentCacheAsync(
      // Leave room for two half tones: one for the start and one for the end
      this.durationMs - TONE_DURATION_MS
    ),
  ]);
  if (this._videoCacheFilename && this._silentCacheFilename) {
    // console.log('>>>>> Stim already cached');
    return; // Nothing more to do
  }
  const encoder = new Encoder(displayKey);
  this.encode(encoder);
  try {
    const videoBuffer = await encoder.getBufferAsync();
    const cachedFilePath = await window.electron.saveBufferToCacheAsync(
      videoBuffer,
      unhashedFilename
    );
    this._videoCacheFilename = await window.electron.addSubtitleAsync(
      cachedFilePath,
      this.durationMs,
      stableStringify(this)
    );
  } catch (error) {
    throw new Error('Caching stim failed: ' + error);
  }
};
