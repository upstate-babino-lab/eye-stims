import { Grating, GratingType } from './Grating';

export class SqrGrating extends Grating {
  constructor(props: Partial<Grating> = {}) {
    super({ ...props, gratingType: GratingType.Sqr });
  }
}
