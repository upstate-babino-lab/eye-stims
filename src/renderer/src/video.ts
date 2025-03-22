import * as Mp4Muxer from 'mp4-muxer';
import { Stimulus } from './stimulus';

export async function encodeStimuliAsync(
  stimuli: Stimulus[],
  width: number,
  height: number,
  fps: number
): Promise<Blob> {
  const videoState = new VideoState(width, height, fps);
  const startTime = new Date().getTime();
  let encodedSecondsSoFar = 0;
  for (let iStim = 0; iStim < stimuli.length; iStim++) {
    const stimulus = stimuli[iStim];
    const nFrames = stimulus.duration * videoState.fps;
    for (let iFrame = 0; iFrame < nFrames; iFrame++) {
      const age = iFrame && iFrame / videoState.fps;
      stimulus.renderFrame(videoState.ctx, age);
      videoState.encodeOneFrame();
    }
    encodedSecondsSoFar += stimulus.duration;
    if (iStim % 100 == 0) {
      const elapsedMinutes = (new Date().getTime() - startTime) / (1000 * 60);
      const speed = Math.round(encodedSecondsSoFar / (elapsedMinutes * 60));
      console.log(
        `>>>>> iStim=${iStim} queueSize=${videoState.videoEncoder.encodeQueueSize}` +
          ` elapsed=${Math.round(elapsedMinutes)}mins speed=${speed}x`
      );
      await videoState.videoEncoder.flush();
    }
  }

  return await videoState.getBlobAsync();
}

// See https://dmnsgn.github.io/media-codecs for list of codecs that browser supports
const CODEC = 'avc1.4d401f'; // avc1.42001f, avc1.4d401f
class VideoState {
  readonly fps: number; // frames per second
  readonly canvas: OffscreenCanvas;
  readonly ctx: OffscreenCanvasRenderingContext2D;
  readonly muxer: Mp4Muxer.Muxer<Mp4Muxer.ArrayBufferTarget>;
  readonly videoEncoder: VideoEncoder;
  lastFrame: number = 0; // Frames rendered so far

  constructor(width: number, height: number, fps: number) {
    this.fps = fps;
    this.canvas = new OffscreenCanvas(width, height);
    const ctx = this.canvas.getContext('2d', {
      // TODO: Figure out best attributes to maximize speed
      willReadFrequently: true,
    });
    if (ctx) {
      this.ctx = ctx;
    } else {
      throw new Error('Error calling getContext()');
    }
    this.muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: {
        codec: 'avc', // If you change this, make sure to change VideoEncoder codec as well
        width: width,
        height: height,
      },

      // mp4-muxer docs claim you should always use this with ArrayBufferTarget
      fastStart: 'in-memory',
    });

    this.videoEncoder = new VideoEncoder({
      output: (chunk, meta): void => this.muxer.addVideoChunk(chunk, meta),
      error: (e): void => console.error(e),
    });

    this.videoEncoder.configure({
      codec: CODEC,
      width: width,
      height: height,
      //bitrate: 500_000,
      latencyMode: 'realtime',
    });
  }

  encodeOneFrame(): void {
    const frame = new VideoFrame(this.canvas, {
      timestamp: Math.round((this.lastFrame * 1e6) / this.fps), // Microseconds
    });
    this.videoEncoder.encode(frame);
    frame.close();
    this.lastFrame++;
  }

  async getBlobAsync(): Promise<Blob> {
    await this.videoEncoder.flush();
    this.muxer.finalize();
    return new Blob([this.muxer.target.buffer], {
      type: `video/mp4; codecs="${CODEC}"`,
    });
  }
}
