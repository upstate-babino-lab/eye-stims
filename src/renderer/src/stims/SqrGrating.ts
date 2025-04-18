import { Grating, GratingType } from './Grating';

export class SqrGrating extends Grating {
  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super({
      gratingType: GratingType.Sqr,
      duration,
      bgColor,
      fgColor,
      speed,
      width,
      angle,
    });
  }
}
