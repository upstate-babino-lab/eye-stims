import { Grating, GratingType } from './Grating';

export class BarGrating extends Grating {
  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super({
      gratingType: GratingType.Bar,
      duration,
      bgColor,
      fgColor,
      speed,
      width,
      angle,
    });
  }
}
