import { Stimulus } from './stimulus';

export default class StimSequence {
  name: string = 'Unnamed StimSequence';
  description: string = '';
  stimuli: Stimulus[] = [];

  constructor(name: string, description?: string, stimuli?: Stimulus[]) {
    this.name = name;
    this.description = description ?? this.description;
    this.stimuli = stimuli ?? this.stimuli;
  }
}
