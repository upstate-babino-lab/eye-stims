export enum StimTypeName {
  Uninitialized = 'Uninitialized',
  Solid = 'Solid',
  Bar = 'Bar',
  SinGrating = 'SinGrating',
  SqrGrating = 'SqrGrating',
  // TODO next: grating, letter, checkerboard, wait
}

export abstract class Stimulus {
  name: StimTypeName;
  duration: number = 10; // Seconds
  bgColor: string = 'black';
  meta?: Record<string, unknown> = {};
  _cachedFilename: string = '';
  _audioCacheFilename: string = '';
  constructor(
    name: StimTypeName,
    duration?: number,
    bgColor?: string,
    meta?: Record<string, unknown>
  ) {
    // console.log(`>>>>> constructor abstract Stimulus(${name}, ${duration} ${bgColor})`);
    this.name = name;
    this.duration = duration ?? this.duration;
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
      const age = (newTimestamp - lastTimestamp) / 1000; // Seconds
      if (age < this.duration) {
        this.renderFrame(ctx, age);
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
