import { Stimulus } from './stimulus';

export default class StimSequence {
  name: string = 'Uninitialized StimSequence';
  description: string = '';
  stimuli: Stimulus[] = [];

  constructor(name?: string, description?: string, stimuli?: Stimulus[]) {
    this.name = name ?? this.name;
    this.description = description ?? this.description;
    this.stimuli = stimuli ?? this.stimuli;
  }

  duration(): number {
    return this.stimuli
      .map((s) => s.duration)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }
}
