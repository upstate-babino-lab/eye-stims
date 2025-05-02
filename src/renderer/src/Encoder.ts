import * as Mp4Muxer from 'mp4-muxer';
import { DisplayKey, DisplayProps, displays } from '../../displays';

// See https://dmnsgn.github.io/media-codecs for list of codecs that browser supports
// TODO: Try vp8 because it's supposed to be faster
const CODEC_BASE = 'avc'; // "avc1" | "hevc" | "vp9" | "av1"
const CODEC = CODEC_BASE + '1.640028'; // avc1.42001f | avc1.4d401f | avc1.64001f
/*
avc1.42e01e: Baseline max 1280x720 at 30fps
avc1.42001f: Baseline, no B-frames, low complexity, streaming, max 1280x720 at 60fps.
avc1.4d401f: Main, better compression, Level 4.0 resolutions up to 1920x1080 at 30fps.
avc1.64001f: High, Level 4.2 resolutions up to 1920x1080 at 60fps.
avc1.640028: Level 4.1 can handle 1920x1088 (padding out to multiple of 16)
*/
export class Encoder {
  readonly displayProps: DisplayProps;
  readonly canvas: OffscreenCanvas;
  readonly ctx: OffscreenCanvasRenderingContext2D;
  readonly muxer: Mp4Muxer.Muxer<
    Mp4Muxer.ArrayBufferTarget | Mp4Muxer.FileSystemWritableFileStreamTarget
  >;
  readonly videoEncoder: VideoEncoder;
  private fileStream?: FileSystemWritableFileStream;
  private solidBlackCanvas: OffscreenCanvas;
  lastFrame: number = 0; // Frames rendered so far

  constructor(displayKey: DisplayKey, fileStream?: FileSystemWritableFileStream) {
    this.displayProps = displays[displayKey];
    this.canvas = new OffscreenCanvas(
      this.displayProps.width,
      this.displayProps.height
    );
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
        codec: CODEC_BASE,
        width: this.displayProps.width,
        height: this.displayProps.height,
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
      width: this.displayProps.width,
      height: this.displayProps.height,
      framerate: this.displayProps.fps,
      //bitrate: 500_000,
      latencyMode: 'realtime', // Prioritize low latency encoding over compression quality
    });

    this.solidBlackCanvas = new OffscreenCanvas(
      this.displayProps.width,
      this.displayProps.height
    );
    const blackCtx = this.solidBlackCanvas.getContext('2d', {
      willReadFrequently: true,
    });
    if (!blackCtx) {
      throw new Error('Error calling getContext() for blackCtx');
    }
    blackCtx.fillStyle = 'black';
    blackCtx.fillRect(0, 0, blackCtx.canvas.width, blackCtx.canvas.height);
  }

  // Encode current state of the canvas as one additional frame
  encodeOneFrame(isSolidBlack: boolean = false): void {
    const frame = new VideoFrame(
      isSolidBlack ? this.solidBlackCanvas : this.canvas,
      {
        timestamp: Math.round((this.lastFrame * 1e6) / this.displayProps.fps), // Microseconds
        //transfer: true, // Avoids unnecessary data copying
      }
    );
    this.videoEncoder.encode(frame);
    frame.close();
    this.lastFrame++;
  }

  // Only if NOT using fileStream
  async getBufferAsync(): Promise<ArrayBuffer> {
    this.encodeOneFrame(); // One additional before saving, else too short
    await this.videoEncoder.flush();
    this.muxer.finalize();

    return this.muxer.target['buffer'];
  }

  // Only if NOT using fileStream
  async getBlobAsync(): Promise<Blob | null> {
    if (!this.muxer.target['buffer']) {
      return null;
    }
    return new Blob([await this.getBufferAsync()], {
      type: `video/mp4; codecs="${CODEC}"`,
    });
  }
}
