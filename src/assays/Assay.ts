/*
  A StimsAssay is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or used to create a StimSequence
*/
import { Stimulus } from '@stims/index';
import { addIntegrityFlashes, addRestPeriods, shuffle } from '@stims/stim-utils';

// TODO: Create StimsAssay subclasses for each type of StimsAssay
export enum AssayType {
  SqrGratingPairs = 'SqrGratingPairs',
  ScanningDot = 'ScanningDot',
  FullFieldSine = 'FullFieldSine',
}

type AssayInfo = {
  description: string;
};
export const assaysInfo: Record<AssayType, AssayInfo> = {
  SqrGratingPairs: {
    description:
      'Pairs of gratings moving left and right ' +
      'for each cpd, contrast, and speed.',
  },
  ScanningDot: {
    description: 'Flash Dot on grid for each xDegree yDegree, and diameter.',
  },
  FullFieldSine: {
    description: 'Sinusoidal variations of intensity over full field.',
  },
};

export type AssayProps = {
  assayType: AssayType;
  title?: string;
  description?: string;
  // Duration of body and tail in milliseconds
  // Total duration of each Stimulus will be
  // head(0) + body + tail = (2 * bodyMs)
  bodyMs?: number; // Multiple of 20
  tailMs?: number; // Multiple of 20
  hasMeanColorTail?: boolean; // Black if false
  includeStaticGratings?: boolean;
  nRepetitions?: number; // Number of repetitions of the whole sequence
  integrityFlashIntervalMins?: number;
  restIntervalMins?: number; // Minutes between rests
  restDurationMins?: number; // Minutes of solid black
  doShuffle?: boolean;
};
export abstract class Assay {
  assayType: AssayType = Object.values(AssayType)[0];
  title: string = '';
  description: string = '';
  bodyMs: number = 500;
  tailMs: number = 500;
  hasMeanColorTail: boolean = false;
  nRepetitions: number = 1;
  integrityFlashIntervalMins: number = 0;
  restIntervalMins: number = 2;
  restDurationMins: number = 2;
  doShuffle: boolean = false; // Shuffle the stimuli by default
  //private _stimsCache: Stimulus[] = [];
  //private _jsonCache: string = '';

  constructor(props: AssayProps) {
    this.assayType = props.assayType ?? this.assayType;
    this.title = props.title ?? this.title;
    this.description =
      props.description ??
      (this.description || assaysInfo[this.assayType].description);
    this.bodyMs = Math.max(0, props.bodyMs ?? this.bodyMs);
    this.tailMs = Math.max(0, props.tailMs ?? this.tailMs);
    this.hasMeanColorTail = this.hasMeanColorTail ?? this.hasMeanColorTail;
    this.nRepetitions = props.nRepetitions ?? this.nRepetitions;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
    this.restIntervalMins = props.restIntervalMins ?? this.restIntervalMins;
    this.restDurationMins = props.restDurationMins ?? this.restDurationMins;
    this.doShuffle = props.doShuffle ?? this.doShuffle;
  }

  // Returns POJOs not shuffled and without integrity flashes or rest periods
  abstract baseStimuli(): Stimulus[];

  // TODO: return from private cache if JSON has not changed?
  // If we don't use cache stims will be reshuffled every time.
  stimuli(): Stimulus[] {
    let result = this.baseStimuli();
    if (this.doShuffle) {
      shuffle(result); // Optional in-place shuffle before inserting integrity flashes and rests
    }

    // Insert required and optional integrity flashes
    result = addIntegrityFlashes(result, this.integrityFlashIntervalMins);

    // Insert optional rest periods
    result = addRestPeriods(result, this.restIntervalMins, this.restDurationMins);
    return result;
  }
}
