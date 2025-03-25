import { Stimulus } from './stimulus';
import { Encoder } from './Encoder';

export default class StimSequence {
  name: string = 'Uninitialized StimSequence';
  readonly description: string = '';
  readonly stimuli: Stimulus[] = [];
  times: number[] = []; // Seconds into sequence
  private cachedDuration: number = -1;
  isEncoding: boolean = false;

  constructor(name?: string, description?: string, stimuli?: Stimulus[]) {
    this.name = name ?? this.name;
    this.description = description ?? this.description;
    this.stimuli = stimuli ?? this.stimuli;
  }

  // Calculate total duration AND populate times array in the same loop
  duration(): number {
    if (this.cachedDuration >= 0) {
      return this.cachedDuration;
    }
    this.times = new Array(this.stimuli.length);
    const total = this.stimuli
      .map((s) => s.duration)
      .reduce((accumulator, currentValue, currentIndex) => {
        this.times[currentIndex] = accumulator;
        return accumulator + currentValue;
      }, 0);
    this.cachedDuration = total;
    return total;
  }

  /* TODO?
Cache encoded stim videos in files cache directory (possible to cache in memory?)
import { app } from "electron";
import path from "path";
const cacheDir = path.join(app.getPath("userData"), "cache");
*/

  async encodeAsync(
    width: number,
    height: number,
    fps: number,
    fileStream?: FileSystemWritableFileStream
  ): Promise<void> {
    this.isEncoding = true;
    const videoState = new Encoder(width, height, fps, fileStream);
    const duration = this.duration();
    console.log(
      `>>>>> Encoding to ${fileStream ? 'disk' : 'memory'} ${this.stimuli.length} stimuli`
    );
    const startTime = new Date().getTime();
    let encodedSecondsSoFar = 0;
    for (let iStim = 0; iStim < this.stimuli.length; iStim++) {
      const stimulus = this.stimuli[iStim];
      const nFrames = stimulus.duration * videoState.fps;
      for (let iFrame = 0; iFrame < nFrames; iFrame++) {
        const age = iFrame && iFrame / videoState.fps;
        stimulus.renderFrame(videoState.ctx, age);
        videoState.encodeOneFrame();
      }
      encodedSecondsSoFar += stimulus.duration;
      if (iStim % 100 == 0) {
        // Periodically log and flush
        const secondsRemainingToEncode = duration - encodedSecondsSoFar;
        const nowTime = new Date().getTime();
        const elapsedMinutes = ( nowTime - startTime) / (1000 * 60);
        const speed = Math.round(encodedSecondsSoFar / (elapsedMinutes * 60));
        const expectedMinutesToFinish = Math.round(secondsRemainingToEncode / (speed * 60));
        console.log(
          `>>>>> iStim=${iStim} queueSize=${videoState.videoEncoder.encodeQueueSize} ` +
            `elapsed=${Math.round(elapsedMinutes)}mins speed=${speed}x ` +
            `remaining=${expectedMinutesToFinish}mins ` +
            `will finish at ${new Date(nowTime + (expectedMinutesToFinish * 60_000)).toLocaleTimeString()}`
        );
        await videoState.videoEncoder.flush();
      }
    }

    // All done
    await videoState.videoEncoder.flush();
    videoState.muxer.finalize();
    if (fileStream) {
      await fileStream.close();
    }
    console.log(
      `>>>>> Done encoding to ${fileStream ? 'disk' : 'memory'} ${this.stimuli.length} stimuli`
    );
    this.isEncoding = false;
  }
}
