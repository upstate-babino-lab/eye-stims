export enum StimTypeName {
  Uninitialized = 'Uninitialized',
  Solid = 'Solid',
  Bar = 'Bar',
  // TODO next: grating, letter, checkerboard, wait
}

export abstract class Stimulus {
  name: StimTypeName;
  duration: number = 1; // Seconds
  bgColor: string = 'black';
  _cachedFilename: string = ''; // Not serialized

  constructor(name: StimTypeName, duration?: number, bgColor?: string) {
    // console.log(`>>>>> constructor abstract Stimulus(${name}, ${duration} ${bgColor})`);
    this.name = name;
    this.duration = duration ?? this.duration;
    this.bgColor = bgColor ?? this.bgColor;
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
