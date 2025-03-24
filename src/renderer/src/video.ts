import * as Mp4Muxer from 'mp4-muxer';
import { Stimulus } from './stimulus';

/* TODO?
Cache encoded stim videos in files cache directory (possible to cache in memory?)
import { app } from "electron";
import path from "path";
const cacheDir = path.join(app.getPath("userData"), "cache");
*/

export async function encodeStimuliAsync(
  stimuli: Stimulus[],
  width: number,
  height: number,
  fps: number,
  fileStream?: FileSystemWritableFileStream
): Promise<void> { // Promise<Blob | null> {
  const videoState = new VideoState(width, height, fps, fileStream);
  console.log(
    `>>>>> Encoding to ${fileStream ? 'disk' : 'memory'} ${stimuli.length} stimuli`
  );
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
      // Periodically log and flush
      const elapsedMinutes = (new Date().getTime() - startTime) / (1000 * 60);
      const speed = Math.round(encodedSecondsSoFar / (elapsedMinutes * 60));
      console.log(
        `>>>>> iStim=${iStim} queueSize=${videoState.videoEncoder.encodeQueueSize}` +
          ` elapsed=${Math.round(elapsedMinutes)}mins speed=${speed}x`
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
    `>>>>> Done encoding to ${fileStream ? 'disk' : 'memory'} ${stimuli.length} stimuli`
  );
  //return await videoState.getBlobAsync();
}

// See https://dmnsgn.github.io/media-codecs for list of codecs that browser supports
const CODEC = 'avc1.4d401f'; // avc1.42001f, avc1.4d401f
class VideoState {
  readonly fps: number; // frames per second
  readonly canvas: OffscreenCanvas;
  readonly ctx: OffscreenCanvasRenderingContext2D;
  readonly muxer: Mp4Muxer.Muxer<
    Mp4Muxer.ArrayBufferTarget | Mp4Muxer.FileSystemWritableFileStreamTarget
  >;
  readonly videoEncoder: VideoEncoder;
  private fileStream?: FileSystemWritableFileStream;
  lastFrame: number = 0; // Frames rendered so far

  constructor(
    width: number,
    height: number,
    fps: number,
    fileStream?: FileSystemWritableFileStream
  ) {
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
    if (fileStream) {
      this.fileStream = fileStream;
    }
    this.muxer = new Mp4Muxer.Muxer({
      target: this.fileStream
        ? new Mp4Muxer.FileSystemWritableFileStreamTarget(this.fileStream)
        : new Mp4Muxer.ArrayBufferTarget(),
      video: {
        codec: 'avc', // If you change this, make sure to change VideoEncoder codec as well
        width: width,
        height: height,
      },
      fastStart: this.fileStream
        ? false // Recommended for large, unbounded files that are streamed directly to disk
        : 'in-memory', // Preferred option when using ArrayBufferTarget
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

  // Encode current state of the canvas as one additional frame
  encodeOneFrame(): void {
    const frame = new VideoFrame(this.canvas, {
      timestamp: Math.round((this.lastFrame * 1e6) / this.fps), // Microseconds
    });
    this.videoEncoder.encode(frame);
    frame.close();
    this.lastFrame++;
  }

  async getBlobAsync(): Promise<Blob | null> {
    if (this.muxer.target['buffer']) {
      await this.videoEncoder.flush();
      this.muxer.finalize();
  
      return new Blob([this.muxer.target['buffer']], {
        type: `video/mp4; codecs="${CODEC}"`,
      });
    }
    return null;
  }
}
