import { Stimulus } from '@stims/Stimulus';
import { AssayType, Assay } from './Assay';
import { ImageStim } from '@stims/index';

export class ImagesAssay extends Assay {
  size: number = 100; // Percentage of viewport maximum
  directory: string = ''; // Will use all images in this directory

  constructor(props: Partial<ImagesAssay> = {}) {
    // TODO: Check that parameters are all in valid ranges
    super({
      ...props,
      assayType: AssayType.Letters,
    });
    this.size = props.size ?? this.size;
    this.directory = props.directory ?? this.directory;
  }

  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      stimuli.push(
        new ImageStim({
          durationMs: this.bodyMs + this.tailMs,
          bodyMs: this.bodyMs,
          tailMs: this.tailMs,
          size: this.size,
        })
      );
    }
    return stimuli;
  }
}
