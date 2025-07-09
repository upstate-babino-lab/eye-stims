/*
  A StimsSpec is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or used to create a StimSequence
*/
import { Stimulus, Solid } from '@stims/index';

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
  restIntervalMins?: number; // Minutes between rests
  restDurationMins?: number; // Minutes of solid black
  doShuffle?: boolean;
};
export abstract class StimsSpec {
  stimSpecType: StimSpecType = Object.values(StimSpecType)[0];
  title: string = '';
  description: string = '';
  bodyMs: number = 500;
  tailMs: number = 1000;
  grayMs: number = 0;
  grayTailMs: number = 520; // only used if grayMs > 0
  nRepetitions: number = 1;
  integrityFlashIntervalMins: number = 0;
  restIntervalMins: number = 2;
  restDurationMins: number = 2;
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
    this.restIntervalMins = props.restIntervalMins ?? this.restIntervalMins;
    this.restDurationMins = props.restDurationMins ?? this.restDurationMins;
    this.doShuffle = props.doShuffle ?? this.doShuffle;
  }

  // Returns POJOs not shuffled and without integrity flashes or rest periods
  abstract baseStimuli(): Stimulus[];

  // TODO: return from private cache if JSON has not changed?
  // If we don't use cache stims will be reshuffled every time.
  stimuli(): Stimulus[] {
    // Optional in-place shuffle before inserting integrity flashes and rests
    const shuffledNestedStims = this.doShuffle
      ? this.baseStimuli().sort(() => Math.random() - 0.5)
      : this.baseStimuli();
    const integrityFlashGroup = [
      new Solid({ bgColor: 'oklch(0.5 0 0)', durationMs: 1260, bodyMs: 260 }), // Perceptually gray
      new Solid({ bgColor: 'red', durationMs: 1260, bodyMs: 260 }),
      new Solid({ bgColor: 'green', durationMs: 1260, bodyMs: 260 }),
      new Solid({ bgColor: 'blue', durationMs: 1260, bodyMs: 260 }),
    ];

    // Required integrity flashes at start
    let result: Stimulus[] = [...integrityFlashGroup, ...shuffledNestedStims];

    // Insert optional integrity flashes
    if (this.integrityFlashIntervalMins && this.integrityFlashIntervalMins > 0) {
      result = insertAtIntervals(
        result,
        this.integrityFlashIntervalMins,
        integrityFlashGroup
      );
    }

    // Insert optional rest periods
    if (this.restIntervalMins && this.restIntervalMins > 0) {
      const oneMinuteRest = new Solid({
        bgColor: 'black',
        durationMs: 60 * 1000,
        meta: { comment: `rest` },
      });
      result = insertAtIntervals(
        result,
        this.restIntervalMins,
        Array(Math.round(this.restDurationMins)).fill(oneMinuteRest)
      );
    }

    // Required integrity flashes at end
    result = [...result, ...integrityFlashGroup];

    return result;
  }
}

//-----------------------------------------------------------------------------
function insertAtIntervals(
  inStims: Stimulus[],
  intervalMins: number,
  newStims: Stimulus[]
): Stimulus[] {
  const outStims: Stimulus[] = [];
  const intervalMs = intervalMins * 60 * 1000; // Convert minutes
  let timeElapsed = 0;
  inStims.forEach((stim) => {
    timeElapsed += stim.durationMs;
    if (timeElapsed >= intervalMs) {
      outStims.push(...newStims); // Insert newStims at the interval
      timeElapsed = 0; // Reset time elapsed after inserting newStims
    }
    outStims.push(stim);
  });
  return outStims;
}
