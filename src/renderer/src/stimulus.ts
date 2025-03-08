export enum StimTypeName {
  Solid = 'Solid',
  Bar = 'Bar',
}

export abstract class Stimulus {
  name: StimTypeName;
  duration: number = 1; // Seconds
  bgColor: string = 'black';

  constructor(name: StimTypeName, duration?: number, bgColor?: string) {
    this.name = name;
    if (duration) this.duration = duration;
    if (bgColor) this.bgColor = bgColor;
  }

  render(canvas: HTMLCanvasElement | OffscreenCanvas): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('render() got invalid context from canvas');
    }
    if (canvas instanceof OffscreenCanvas) {
      // Offscreen
    } else {
      // Onscreen animation
      let lastTimestamp = 0;
      const animate = (timestamp: number): void => {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }
        const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert to seconds
        if (deltaTime < this.duration) {
          this.renderFrame(canvas, ctx, deltaTime);
          requestAnimationFrame(animate);
        } else {
          console.log('Onscreen animation completed');
        }
      };
      requestAnimationFrame(animate);
    }
  }

  abstract renderFrame(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  );
}

export class Solid extends Stimulus {
  constructor({ duration, bgColor }: Partial<Solid> = {}) {
    super(StimTypeName.Solid, duration, bgColor);
  }
  renderFrame(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds <= this.duration) {
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}

export class Bar extends Stimulus {
  // TODO: change parameters to match eye-candy
  fgColor: string = 'white';
  speed: number = 100; // pixels per second
  width: number = 100; // pixels
  angle: number = 1; // clockwise in radians

  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Bar> = {}) {
    super(StimTypeName.Bar, duration, bgColor);
    if (fgColor) this.fgColor = fgColor;
    if (speed) this.speed = speed;
    if (width) this.width = width;
    if (angle) this.angle = angle;
  }

  renderFrame(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds <= this.duration) {
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// Map of constructors allowing lookup by name
export const stimConstructors = {
  Solid: Solid,
  Bar: Bar,
};
