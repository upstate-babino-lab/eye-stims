export class RangeSpec {
  start?: number;
  step?: number;
  nSteps?: number;

  constructor(props: Partial<RangeSpec> = {}) {
    this.start = props.start;
    this.step = props.step;
    this.nSteps = props.nSteps;
  }

  get list(): number[] {
    const result: number[] = [];
    if (this.start != undefined) {
      for (let i = 0; i < (this.nSteps ?? 1); i++) {
        result.push(this.start + i * (this.step ?? 1));
      }
    }
    return result;
  }
}
