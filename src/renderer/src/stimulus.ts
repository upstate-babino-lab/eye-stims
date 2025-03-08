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
}

export class Solid extends Stimulus {
  constructor({ duration, bgColor }: Partial<Solid> = {}) {
    super(StimTypeName.Solid, duration, bgColor);
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
}

export const stimConstructors = {
  Solid: Solid,
  Bar: Bar,
};
