import { Stimulus } from './Stims/Stimulus';
import './Stims/StimulusElectron';
import { Encoder } from './Encoder';
import { DisplayKey } from '../../displays';
import { deepDeduplicate } from './utilities';

type ProgressCallback = (label: string, nDone: number, nTotal: number) => void;
export default class StimSequence {
  fileBasename: string = '';
  name: string = 'Uninitialized StimSequence';
  readonly description: string = '';
  readonly stimuli: Stimulus[] = [];
  startTimes: number[] = []; // Seconds into sequence
  private cachedDuration: number = -1; // Sum of all stimuli durations
  private cancelSaving: boolean = false; // Set to true to cancel saving
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
    this.stimuli = deepDeduplicate(stims);
  }

  // Calculate total duration AND populate times array in the same loop
  duration(): number {
    if (this.cachedDuration >= 0) {
      return this.cachedDuration;
    }
    this.startTimes = new Array(this.stimuli.length);
    const total = this.stimuli
      .map((s) => s.duration)
      .reduce((accumulator, currentValue, currentIndex) => {
        this.startTimes[currentIndex] = accumulator;
        return accumulator + currentValue;
      }, 0);
    this.cachedDuration = total;
    return total;
  }

  async saveToCacheAsync(displayKey: DisplayKey, cbProgress?: ProgressCallback) {
    this.cancelSaving = false;
    let intervalId: NodeJS.Timeout | null = null;
    if (cbProgress) {
      cbProgress('saveToCache', 0, this.stimuli.length);
      intervalId = setInterval(() => {
        cbProgress('saveToCache', this.nCachedStims(), this.stimuli.length);
      }, 300);
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
      await stimulus.saveToCacheAsync(displayKey);
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
    return this.stimuli.filter((stim) => stim._cachedFilename).length;
  }

  private async saveFileDialogAsync(suggestedFilename: string): Promise<string> {
    const result = await window.electron.showSaveDialog({
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
      this.saveToCacheAsync(displayKey, cbProgress),
    ]);
    if (!outputFilename) {
      return 'Canceled';
    }
    if (cbProgress) {
      cbProgress('buildFromCache...', 0, this.stimuli.length);
    }
    const result = await window.electron.buildFromCacheAsync(
      displayKey,
      this.stimuli.map((stim) => stim._cachedFilename),
      this.startTimes,
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
        encodedSecondsSoFar += stimulus.duration;
        const secondsRemainingToEncode = duration - encodedSecondsSoFar;
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
