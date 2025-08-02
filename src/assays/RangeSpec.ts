export class RangeSpec {
  start?: number;
  step?: number;
  nSteps?: number;
  min?: number;
  max?: number;

  constructor(props: Partial<RangeSpec> = {}) {
    this.start = props.start;
    this.step = props.step;
    this.nSteps = props.nSteps;
    this.min = props.min;
    this.max = props.max;
  }

  get list(): number[] {
    const result: number[] = [];
    if (this.start != undefined) {
      for (let i = 0; i < (this.nSteps ?? 1); i++) {
        let nextValue = this.start + i * (this.step ?? 1);
        nextValue = Math.round(nextValue * 100_000) / 100_000; // Round to 5 decimal places
        result.push(confine(nextValue, this.min, this.max));
      }
    }
    return result;
  }
}

//-----------------------------------------------------------------------------
export function confine(n: unknown, min?: number, max?: number) {
  const nAsNumber = n as number;
  let nConfined: number = Math.max((min as number) ?? nAsNumber, nAsNumber);
  nConfined = Math.min((max as number) ?? nConfined, nConfined);
  return nConfined;
}
