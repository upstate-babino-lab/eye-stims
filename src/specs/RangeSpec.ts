export class RangeSpec {
  start: number;
  step: number;
  nSteps: number;

  constructor(props: Partial<RangeSpec> = {}) {
    this.start = props.start || 0;
    this.step = props.step || 1;
    this.nSteps = props.nSteps || 1;
  }

  get list(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.nSteps; i++) {
      result.push(this.start + i * this.step);
    }
    return result;
  }
}
