import { Solid } from './Solid';
import { Stimulus } from './Stimulus';

export type RangeSpec = {
  start?: number;
  step?: number;
  end?: number;
  list?: number[]; // If empty or undefined, use start, step, end
};

export class StimsSpec {
  name: string = '';
  description?: string;
  specType: string = '';
  cpd?: RangeSpec;
  contrast?: RangeSpec;
  speed?: RangeSpec;
  integrityFlashMins: number = 0;

  constructor(props: Partial<StimsSpec> = {}) {
    this.name = props.name ?? this.name;
    this.description = props.description ?? this.description;
    this.specType = props.specType ?? this.specType;
    this.cpd = props.cpd ?? this.cpd;
    this.contrast = props.contrast ?? this.contrast;
    this.speed = props.speed ?? this.speed;
    this.integrityFlashMins = props.integrityFlashMins ?? this.integrityFlashMins;
  }

  // Generate list if necessary
  getListByName(name: string): number[] {
    if (!['cpd', 'contrast', 'speed'].includes(name)) {
      throw new Error(`${name} property of StimSpec is not a RangeSpec`);
    }
    const range: RangeSpec = this[name as keyof StimsSpec] as RangeSpec;
    if (range && range.list && range.list.length > 0) {
      return range.list;
    }
    if (
      range &&
      range.start !== undefined &&
      range.step !== undefined &&
      range.end !== undefined
    ) {
      return Array.from(
        { length: Math.floor((range.end - range.start) / range.step) + 1 },
        (_, i) => range.start! + i * range.step!
      );
    }
    return [];
  }
}

export function generateStimuliFromSpec(spec: Partial<StimsSpec>): Stimulus[] {
  const stimSpec = new StimsSpec(spec);
  const stimuli: Stimulus[] = [];
  const r1 = stimSpec.getListByName('cpd');
  const r2 = stimSpec.getListByName('contrast');
  const r3 = stimSpec.getListByName('speed');
  for (const num1 of r1) {
    for (const num2 of r2) {
      for (const num3 of r3) {
        const stim = new Solid({
          durationMs: 1000,
          bgColor: 'green',
          meta: { num1: num1, num2: num2, num3: num3 },
        });
        stimuli.push(stim);
      }
    }
  }
  return stimuli;
}
