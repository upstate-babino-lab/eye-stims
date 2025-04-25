import { Grating, GratingType } from './Grating';

export class SinGrating extends Grating {
  constructor(props: Partial<Grating> = {}) {
    super({ ...props, gratingType: GratingType.Sin });
  }
}
