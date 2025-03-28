import * as Mp4Muxer from 'mp4-muxer';

// See https://dmnsgn.github.io/media-codecs for list of codecs that browser supports
const CODEC_BASE = 'avc'; // "avc" | "hevc" | "vp9" | "av1"
const CODEC = CODEC_BASE + '1.64001f'; // 1.4d401f | avc1.42001f | avc1.4d401f | avc1.64001f
export class Encoder {
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
        codec: CODEC_BASE,
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
      latencyMode: 'quality', // 'realtime',
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

  // Only if NOT using fileStream
  async getBufferAsync(): Promise<ArrayBuffer> {
    //this.encodeOneFrame(); // One additional before saving
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
