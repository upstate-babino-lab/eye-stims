import { Encoder } from './Encoder';

export enum StimTypeName {
  Solid = 'Solid',
  Bar = 'Bar',
  // TODO next: grating, letter, checkerboard, wait
}

export abstract class Stimulus {
  name: StimTypeName;
  duration: number = 1; // Seconds
  bgColor: string = 'black';

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

  // Animate only for on-screen context (concrete method)
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

  encode(encoder: Encoder) {
    const nFrames = this.duration * encoder.fps;
    for (let iFrame = 0; iFrame < nFrames; iFrame++) {
      const age = iFrame && iFrame / encoder.fps;
      this.renderFrame(encoder.ctx, age);
      encoder.encodeOneFrame();
    }
  }

  async saveToCacheAsync(width, height, fps) {
    const unhashedFilename =
      `${width}x${height}-${fps}` + JSON.stringify(this) + '.mp4';

    if (await window.electron.isCached(unhashedFilename)) {
      console.log('>>>>> Stim already cached');
      // Nothing to do
      return;
    }
    const encoder = new Encoder(width, height, fps);
    this.encode(encoder);
    try {
      const path = await window.electron.saveBufferToCache(
        await encoder.getBufferAsync(),
        unhashedFilename
      );
      console.log('>>>>> Stim cached at:', path);
    } catch (error) {
      throw new Error('Stim cache failed: ' + error);
    }
  }
}

export class Solid extends Stimulus {
  constructor({ duration, bgColor }: Partial<Solid> = {}) {
    // console.log(`>>>>> constructor Solid(duration=${duration}, bgColor=${bgColor})`);
    super(StimTypeName.Solid, duration, bgColor);
  }
  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.duration) {
      return;
    }
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

export class Bar extends Stimulus {
  // TODO: change parameters to match eye-candy
  fgColor: string = 'white';
  speed: number = 100; // pixels per second
  width: number = 100; // pixels
  angle: number = 0; // degrees

  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Bar> = {}) {
    // console.log(`>>>>> constructor Bar(duration=${duration}, bgColor=${bgColor}, ...)`);
    super(StimTypeName.Bar, duration, bgColor);
    this.fgColor = fgColor ?? this.fgColor;
    this.speed = speed ?? this.speed;
    this.width = width ?? this.width;
    this.angle = angle ?? this.angle;
  }

  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.duration) {
      return;
    }
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const diagonal = Math.sqrt(
      ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height
    );
    const drawBar = (x: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Translate to canvas center to ensure rotation happens around the center.
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(degreesToRadians(this.angle));

      ctx.translate(x - ctx.canvas.width / 2, 0);
      ctx.fillStyle = this.fgColor;
      ctx.fillRect(-this.width / 2, -diagonal / 2, this.width, diagonal);
      ctx.restore();
    };

    const barX = Math.round(ageSeconds * this.speed) % ctx.canvas.width;
    drawBar(barX);
  }
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Map of constructors allowing lookup by name
export const stimConstructors = {
  Solid: Solid,
  Bar: Bar,
};

export function newStimulus(stim: Stimulus) {
  const isValidStimType = stim && Object.values(StimTypeName).includes(stim.name);
  let constructor = stimConstructors['Solid']; // TODO: a default Error stimulus
  if (isValidStimType) {
    constructor = stimConstructors[stim.name];
  } else {
    console.log(`ERROR from newStimulus(): '${stim?.name}' invalid StimTypeName`);
  }
  return new constructor(stim);
}
