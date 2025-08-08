import { Stimulus } from '@stims/index';
import './StimulusElectron';
import { Encoder } from './Encoder';
import { DisplayKey } from '../displays';
import { filterPrivateAndNullProperties, getStartTimes } from '../shared-utils';
import { newStimulus } from '@src/stims/stimFactory';
import { saveFileDialogAsync } from './render-utils';
import { frameWithBlack } from '@src/stims/stim-utils';

export type ProgressCallback = (
  label: string,
  nDone?: number,
  nTotal?: number
) => void;
export default class StimSequence {
  readonly stimuli: Stimulus[] = []; // Rich class instances (not POJOs)
  private _cachedDuration: number = -1; // Sum of all stimuli durations
  private _cancelSaving: boolean = false; // Set to true to cancel saving
  // @ts-ignore: TS6133
  private _isEncoding: boolean = false;

  constructor(
    stimPojos?: Stimulus[] // Can be POJOs or Stimulus class instances
  ) {
    const stims = stimPojos?.map((s) => newStimulus(s)) ?? this.stimuli;
    this.stimuli = frameWithBlack(stims);
  }

  // Milliseconds into sequence
  // TODO: cache result and return defensive copy
  get startTimes(): number[] {
    return getStartTimes(this.stimuli.map((s) => s.durationMs));
  }

  // Returns total milliseconds
  duration(): number {
    if (this.stimuli.length === 0) {
      return 0;
    }
    if (this._cachedDuration >= 0) {
      return this._cachedDuration;
    }
    const iLastStim = this.stimuli.length - 1;
    this._cachedDuration =
      this.startTimes[iLastStim] + this.stimuli[iLastStim].durationMs;
    return this._cachedDuration;
  }

  async saveToCacheAsync(displayKey: DisplayKey, cbProgress?: ProgressCallback) {
    this._cancelSaving = false;
    let intervalId: NodeJS.Timeout | null = null;
    if (cbProgress) {
      cbProgress('saveToCache...', 0, this.stimuli.length);
      intervalId = setInterval(() => {
        cbProgress('saveToCache', this.nCachedStims(), this.stimuli.length);
      }, 1000);
    }

    // TODO: Use limited parallelism -- ideally based on number of CPUs
    // Perhaps WebWorkers are the way?
    /*
    await Promise.all(
      this.stimuli.map((stimulus) => stimulus.saveToCacheAsync(displayKey))
    );
    */
    for (let iStim = 0; iStim < this.stimuli.length; iStim++) {
      if (this._cancelSaving) {
        console.log('>>>>> saveToCacheAsync() cancelled');
        break;
      }
      const stimulus = this.stimuli[iStim];
      await stimulus.cacheStimVideoAsync(displayKey);
      // console.log(`>>>>> Stim ${iStim} cached at:`, stimulus._videoCacheFilename);
    }

    if (cbProgress) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Final call to update progress bar
      cbProgress('saveToCache done', this.nCachedStims(), this.stimuli.length);
    }
  }

  nCachedStims(): number {
    return this.stimuli.filter((stim) => stim._videoCacheFilename).length;
  }

  async buildFromCacheAsync(
    basename: string,
    displayKey: DisplayKey,
    title: string = '',
    description: string = '',
    cbProgress?: ProgressCallback
  ) {
    const [outputFilename] = await Promise.all([
      saveFileDialogAsync(basename + '.mp4'),
      this.saveToCacheAsync(displayKey, cbProgress), // Can start while user is choosing filename
    ]);
    if (!outputFilename) {
      this._cancelSaving = true;
      if (cbProgress) {
        cbProgress('cancelled', 0, 0);
      }
      return 'Canceled';
    }
    if (cbProgress) {
      cbProgress('Building from cache...');
    }
    const result = await window.electron.buildFromCacheAsync(
      this.stimuli.map((stim) => stim._videoCacheFilename || ''),
      this.stimuli.map((s) => s.durationMs),
      outputFilename,
      title,
      description
    );
    if (cbProgress) {
      cbProgress(
        `Build saved to ${outputFilename}`,
        this.stimuli.length,
        this.stimuli.length
      );
    }
    return result;
  }

  async saveStimsAsync(
    filePath: string,
    title: string = 'Untitled',
    description: string = '',
    fromVideoComment?: unknown
  ) {
    const contentJson = JSON.stringify(
      {
        title: title,
        description: description,
        appVersion: await window.electron.getAppVersion(),
        fromVideoComment: fromVideoComment,
        stimuli: this.stimuli || [],
      },
      filterPrivateAndNullProperties,
      4
    );
    window.electron.send('saveFile', {
      filePath: filePath,
      content: contentJson,
    });
  }

  // Streaming encoder no longer used because too slow (not enough parallelism or caching)
  async encodeAsync(
    displayKey: DisplayKey,
    fileStream?: FileSystemWritableFileStream
  ): Promise<void> {
    this._isEncoding = true;
    try {
      const encoder = new Encoder(displayKey, fileStream);
      const duration = this.duration();
      console.log(`>>>>> Encoding ${this.stimuli.length} stimuli...`);
      const startTime = new Date().getTime();
      let encodedSecondsSoFar = 0;
      let elapsedMinutes = 0;
      for (let iStim = 0; iStim < this.stimuli.length; iStim++) {
        const stimulus = this.stimuli[iStim];
        stimulus.encode(encoder);
        encodedSecondsSoFar += stimulus.durationMs;
        const secondsRemainingToEncode = (duration - encodedSecondsSoFar) / 1000;
        if ((iStim && iStim % 200 === 0) || iStim >= this.stimuli.length) {
          // Periodically flush and log
          await encoder.videoEncoder.flush();
          const nowTime = new Date().getTime();
          elapsedMinutes = (nowTime - startTime) / (1000 * 60);
          const speed = Math.round(encodedSecondsSoFar / (elapsedMinutes * 60));
          const expectedMinutesToFinish = Math.round(
            secondsRemainingToEncode / (speed * 60)
          );
          console.log(
            `>>>>> iStim=${iStim} ` +
              `elapsed=${elapsedMinutes.toFixed(1)}mins speed=${speed}x ` +
              `will finish in ~${expectedMinutesToFinish}mins at ` +
              `~${new Date(nowTime + expectedMinutesToFinish * 60_000).toLocaleTimeString()}`
          );
        }
      }
      // All done
      await encoder.videoEncoder.flush();
      encoder.muxer.finalize();
      if (fileStream) {
        await fileStream.close();
      }
      console.log(
        `>>>>> Finished encoding ${this.stimuli.length} stimuli at ` +
          new Date().toLocaleTimeString() +
          ` after ${elapsedMinutes} minutes`
      );
    } catch (err) {
      throw new Error(`encodeAsync() ${err}`);
    } finally {
      this._isEncoding = false;
    }
  }
}
