export enum StimTypeName {
  Uninitialized = 'Uninitialized',
  Solid = 'Solid',
  Bar = 'Bar',
  SinGrating = 'SinGrating',
  SqrGrating = 'SqrGrating',
  // TODO next: grating, letter, checkerboard, wait
}

// Needed for now to avoid rounding of audio file durations
// Other option may be to use a fixed-rate audio codec?
export function roundToNearestTen(num: number): number {
  return Math.round(num / 10) * 10;
}

export abstract class Stimulus {
  name: StimTypeName;
  durationMs: number = 10_000; // For now must use nearest multiple of 10
  bgColor: string = 'black';
  meta?: Record<string, unknown> = {};
  _cachedFilename?: string;
  _audioCacheFilename?: string;
  constructor(
    name: StimTypeName,
    durationMs?: number,
    bgColor?: string,
    meta?: Record<string, unknown>
  ) {
    // console.log(`>>>>> constructor abstract Stimulus(${name}, ${duration} ${bgColor})`);
    this.name = name;
    this.durationMs = roundToNearestTen(durationMs ?? this.durationMs);
    this.bgColor = bgColor ?? this.bgColor;
    this.meta = meta ?? this.meta;
  }

  abstract renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void;

  // Animate used only for on-screen context (concrete method)
  preview(ctx: CanvasRenderingContext2D, onAllFramesDone?: () => void) {
    let lastTimestamp = 0;
    const animate = (newTimestamp: number): void => {
      if (!lastTimestamp) {
        lastTimestamp = newTimestamp;
      }
      const ageSeconds = (newTimestamp - lastTimestamp) / 1000; // Seconds
      if (ageSeconds < this.durationMs / 1000) {
        this.renderFrame(ctx, ageSeconds);
        requestAnimationFrame(animate);
      } else {
        if (onAllFramesDone) {
          onAllFramesDone();
        }
      }
    };
    requestAnimationFrame(animate);
  }
}
