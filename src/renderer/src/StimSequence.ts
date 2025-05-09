import { Stimulus } from './stims/Stimulus';
import './stims/StimulusElectron';
import { Encoder } from './Encoder';
import { DisplayKey } from '../../displays';
import { getStartTimes } from '../../shared-utils';

export type ProgressCallback = (
  label: string,
  nDone?: number,
  nTotal?: number
) => void;
export default class StimSequence {
  fileBasename: string = '';
  name: string = 'Uninitialized StimSequence';
  readonly description: string = '';
  readonly stimuli: Stimulus[] = [];
  startTimes: number[] = []; // Milliseconds into sequence
  private cachedDuration: number = -1; // Sum of all stimuli durations
  private cancelSaving: boolean = false; // Set to true to cancel saving
  // @ts-ignore: TS6133
  private isEncoding: boolean = false;

  constructor(
    fileBasename?: string,
    name?: string,
    description?: string,
    stimuli?: Stimulus[]
  ) {
    this.fileBasename = fileBasename ?? this.fileBasename;
    this.name = name ?? this.name;
    this.description = description ?? this.description;
    const stims = stimuli ?? this.stimuli;
    this.stimuli = stims; // deepDeduplicate(stims);
  }

  // Calculate total duration and populate startTimes array
  // Returns total milliseconds
  duration(): number {
    if (this.cachedDuration >= 0) {
      return this.cachedDuration;
    }
    this.startTimes = getStartTimes(this.stimuli.map((s) => s.durationMs));
    const iLastStim = this.stimuli.length - 1;
    this.cachedDuration =
      this.startTimes[iLastStim] + this.stimuli[iLastStim].durationMs;
    return this.cachedDuration;
  }

  async saveToCacheAsync(displayKey: DisplayKey, cbProgress?: ProgressCallback) {
    this.cancelSaving = false;
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
      if (this.cancelSaving) {
        console.log('>>>>> saveToCacheAsync() cancelled');
        break;
      }
      const stimulus = this.stimuli[iStim];
      await stimulus.cacheStimVideoAsync(displayKey);
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

  private async saveFileDialogAsync(suggestedFilename: string): Promise<string> {
    const result = await window.electron.showSaveDialogAsync({
      title: 'Save File',
      defaultPath: suggestedFilename,
      filters: [{ name: 'Stim videos', extensions: ['mp4'] }],
    });
    if (result.canceled || !result.filePath) {
      this.cancelSaving = true;
      return '';
    }
    return result.filePath;
  }

  async buildFromCacheAsync(
    displayKey: DisplayKey,
    cbProgress?: ProgressCallback
  ) {
    const [outputFilename] = await Promise.all([
      this.saveFileDialogAsync(this.fileBasename + '.mp4'),
      this.saveToCacheAsync(displayKey, cbProgress), // Can start while user is choosing filename
    ]);
    if (!outputFilename) {
      if (cbProgress) {
        cbProgress('cancelled', 0, 0);
      }
      return 'Canceled';
    }
    if (cbProgress) {
      cbProgress('buildFromCache...');
    }
    const result = await window.electron.buildFromCacheAsync(
      displayKey,
      this.stimuli.map((stim) => stim._videoCacheFilename || ''),
      this.stimuli.map((s) => s.durationMs),
      outputFilename
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

  // Streaming encoder no longer used because too slow (not enough parallelism or caching)
  async encodeAsync(
    displayKey: DisplayKey,
    fileStream?: FileSystemWritableFileStream
  ): Promise<void> {
    this.isEncoding = true;
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
      this.isEncoding = false;
    }
  }
}
