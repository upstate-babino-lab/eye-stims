import { Grating, GratingType } from './Grating';

export class SinGrating extends Grating {
  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super({
      gratingType: GratingType.Sin,
      duration,
      bgColor,
      fgColor,
      speed,
      width,
      angle,
    });
  }
}
