import { Grating, GratingType } from './Grating';

export class SinGrating extends Grating {
  constructor({
    durationMs,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super({
      gratingType: GratingType.Sin,
      durationMs,
      bgColor,
      fgColor,
      speed,
      width,
      angle,
    });
  }
}
