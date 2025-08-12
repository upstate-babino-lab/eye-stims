import { Stimulus } from '@stims/Stimulus';
import { AssayType, Assay } from './Assay';
import { ImageStim } from '@stims/index';

export class ImagesAssay extends Assay {
  size: number = 100; // Percentage of viewport maximum
  directory: string = ''; // Will use all images in this directory
  _imagePaths: string[] = []; // Paths to images in the directory

  constructor(props: Partial<ImagesAssay> = {}) {
    // TODO: Check that parameters are all in valid ranges
    super({
      ...props,
      assayType: AssayType.Images,
    });
    this.size = props.size ?? this.size;
    this.directory = props.directory ?? this.directory;
    this._imagePaths = props._imagePaths ?? [];
  }

  set imagePaths(paths: string[]) {
    this._imagePaths = paths;
  }
  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const imagePath of this._imagePaths) {
        stimuli.push(
          new ImageStim({
            durationMs: this.bodyMs + this.tailMs,
            bodyMs: this.bodyMs,
            tailMs: this.tailMs,
            size: this.size,
            filePath: imagePath,
          })
        );
      }
    }
    return stimuli;
  }
}
