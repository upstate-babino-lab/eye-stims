/*
  A StimsSpec is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or used to create a StimSequence
*/
import { Stimulus, Solid } from '@stims/index';
import { NestedStimuli } from '@stims/Stimulus';

// TODO: Create StimSpec subclasses for each type of StimSpec
export enum StimSpecType {
  SqrGratingPairs = 'SqrGratingPairs',
  ScanningDot = 'ScanningDot',
}

type StimSpecInfo = {
  description: string;
};
export const stimSpecsInfo: Record<StimSpecType, StimSpecInfo> = {
  SqrGratingPairs: {
    description:
      'Pairs of gratings moving left and right ' +
      'for each cpd, contrast, and speed.',
  },
  ScanningDot: {
    description: 'Flash Dot on grid for each xDegree yDegree, and diameter.',
  },
};

export type StimsSpecProps = {
  stimSpecType: StimSpecType;
  title?: string;
  description?: string;
  // Duration of body and tail in milliseconds
  // Total duration of each Stimulus will be
  // head(0) + body + tail = (2 * bodyMs)
  bodyMs?: number; // Multiple of 20
  tailMs?: number; // Multiple of 20
  grayMs?: number;
  grayTailMs?: number;
  includeStaticGratings?: boolean;
  nRepetitions?: number; // Number of repetitions of the whole sequence
  integrityFlashIntervalMins?: number;
  restMinutesAfterIntegrityFlash?: number;
  doShuffle?: boolean;
};
export abstract class StimsSpec {
  stimSpecType: StimSpecType = Object.values(StimSpecType)[0];
  title: string = '';
  description: string = '';
  bodyMs: number = 260;
  tailMs: number = 520;
  grayMs: number = 0;
  grayTailMs: number = 520; // only used if grayMs > 0
  nRepetitions: number = 1;
  integrityFlashIntervalMins: number = 0;
  restMinutesAfterIntegrityFlash: number = 1;
  doShuffle: boolean = false; // Shuffle the stimuli by default
  //private _stimsCache: Stimulus[] = [];
  //private _jsonCache: string = '';

  constructor(props: StimsSpecProps) {
    this.stimSpecType = props.stimSpecType ?? this.stimSpecType;
    this.title = props.title ?? this.title;
    this.description =
      props.description ??
      (this.description || stimSpecsInfo[this.stimSpecType].description);
    this.bodyMs = props.bodyMs ?? this.bodyMs;
    this.tailMs = props.tailMs ?? this.tailMs;
    this.grayMs = props.grayMs ?? this.grayMs;
    this.grayTailMs = this.grayMs > 0 ? (props.grayTailMs ?? this.grayTailMs) : 0;
    this.nRepetitions = props.nRepetitions ?? this.nRepetitions;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
    this.restMinutesAfterIntegrityFlash =
      props.restMinutesAfterIntegrityFlash ?? this.restMinutesAfterIntegrityFlash;
    this.doShuffle = props.doShuffle ?? this.doShuffle;
  }

  // Returns POJOs not shuffled and without integrity flashes or rest periods
  abstract baseStimuli(): NestedStimuli;

  // TODO: return from private cache if JSON has not changed?
  // If we don't use cache stims will be reshuffled every time.
  stimuli(): Stimulus[] {
    // Optional in-place shuffle groups before inserting integrity flashes
    const shuffledNestedStims = this.doShuffle
      ? this.baseStimuli().sort(() => Math.random() - 0.5)
      : this.baseStimuli();

    if (this.integrityFlashIntervalMins && this.integrityFlashIntervalMins > 0) {
      const integrityFlashGroup = [
        new Solid({ bgColor: 'white', durationMs: 1260, bodyMs: 260 }),
        new Solid({ bgColor: 'red', durationMs: 1260, bodyMs: 260 }),
        new Solid({ bgColor: 'green', durationMs: 1260, bodyMs: 260 }),
        new Solid({ bgColor: 'blue', durationMs: 1260, bodyMs: 260 }),
      ];
      const nStimsIntegrityInterval = Math.round(
        (this.integrityFlashIntervalMins * 60 * 1000) / (this.bodyMs * 2)
      );
      const augmentedStims = shuffledNestedStims.reduce(
        (acc: NestedStimuli, stim, i) => {
          if (i % nStimsIntegrityInterval === 0) {
            acc.push(integrityFlashGroup);
            if (i > 0 && this.restMinutesAfterIntegrityFlash > 0) {
              // Add a rest period after the integrity flash

              // BUG! BUG! single long Solid duration crashes the program
              // Perhaps because the audio is to long?
              for (let min = 0; min < this.restMinutesAfterIntegrityFlash; min++) {
                // Add one minute of rest
                acc.push(new Solid({ bgColor: 'black', durationMs: 60 * 1000 }));
              }
            }
          }
          acc.push(stim); // Push the current stimulus or stimulus group
          return acc;
        },
        [] as Stimulus[]
      ); // Start with empty accumulator
      return augmentedStims.flat(10) as Stimulus[]; // Flatten the nested arrays
    }
    return shuffledNestedStims.flat(10) as Stimulus[]; // Without integrity flashes
  }
}
