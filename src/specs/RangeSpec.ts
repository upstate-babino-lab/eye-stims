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
        let nextValue = this.start + i * (this.step ?? 1);
        nextValue = Math.round(nextValue * 100_000) / 100_000; // Round to 5 decimal places
        result.push(nextValue);
      }
    }
    return result;
  }
}
