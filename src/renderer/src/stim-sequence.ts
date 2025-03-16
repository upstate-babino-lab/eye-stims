import { Stimulus } from './stimulus';

export default class StimSequence {
  name: string = 'Uninitialized StimSequence';
  description: string = '';
  stimuli: Stimulus[] = [];
  times: number[] = []; // Seconds into sequence

  constructor(name?: string, description?: string, stimuli?: Stimulus[]) {
    this.name = name ?? this.name;
    this.description = description ?? this.description;
    this.stimuli = stimuli ?? this.stimuli;
  }

  // Calculate total duration AND populate times array in the same loop
  duration(): number {
    this.times = new Array(this.stimuli.length);
    const total = this.stimuli
      .map((s) => s.duration)
      .reduce((accumulator, currentValue, currentIndex) => {
        this.times[currentIndex] = accumulator;
        return accumulator + currentValue;
      }, 0);
    return total;
  }
}
