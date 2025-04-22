import { Grating, GratingType } from './Grating';

export class SqrGrating extends Grating {
  constructor({
    durationMs,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super({
      gratingType: GratingType.Sqr,
      durationMs,
      bgColor,
      fgColor,
      speed,
      width,
      angle,
    });
  }
}
