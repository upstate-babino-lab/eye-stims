import { displays } from '../displays';
import { TONE_DURATION_MS } from '../constants';
import { diagonalLength } from './stim-utils';
import { assert } from '../shared-utils';

export enum StimType {
  Uninitialized = 'Uninitialized',
  Solid = 'Solid',
  Dot = 'Dot',
  Bar = 'Bar',
  SinGrating = 'SinGrating',
  SqrGrating = 'SqrGrating',
  FFSine = 'FFSine',
}

// Make sure durations align with 50fps frame rate
// (multiples of 20 milliseconds)
export function roundToValidDuration(num: number): number {
  if (num < 0) {
    return 0;
  }
  if (num < 100) {
    return num;
  }
  return Math.round(num / 20) * 20;
}

export type NestedStimuli = (Stimulus | NestedStimuli)[];

type StimProps = {
  stimType: StimType;
  durationMs?: number;
  bgColor?: string;
  headMs?: number;
  bodyMs?: number;
  tailMs?: number;
  meta?: Record<string, unknown>;
};

// TODO?: Change durations to number of frames, to avoid forcing to multiples of 20ms
export abstract class Stimulus {
  stimType: StimType;
  durationMs: number = 10_000; // Required, multiple of 20, min 200
  bgColor: string = 'black';
  // Head, body and tail are optional, but must sum to duration
  // By default head and tail are 0 and body is full duration
  headMs?: number; // Duration of black before body
  bodyMs?: number; // Duration between head and tail, multiple of 20
  tailMs?: number; // Duration of black after body
  meta?: Record<string, unknown>;
  _videoCacheFilename?: string;
  _silentCacheFilename?: string;

  constructor(props: StimProps) {
    // console.log(`>>>>> constructor abstract Stimulus(${name}, ${duration} ${bgColor})`);
    this.stimType = props.stimType;
    this.bgColor = props.bgColor ?? this.bgColor;
    if (this.bgColor === '#000000') {
      this.bgColor = 'black';
    }
    try {
      [this.headMs, this.bodyMs, this.tailMs] = calculateDurations(
        props.durationMs ?? this.durationMs,
        props.headMs,
        props.bodyMs,
        props.tailMs
      );
    } catch (e) {
      console.error('ERROR: ' + e);
      // eslint-disable-next-line no-debugger
      debugger;
      this.stimType = StimType.Uninitialized;
      [this.headMs, this.bodyMs, this.tailMs] = [
        0,
        props.durationMs ?? this.durationMs,
        0,
      ];
    }
    this.durationMs = this.headMs + this.bodyMs + this.tailMs;
    if (this.headMs == 0) {
      delete this.headMs;
    }
    if (this.bodyMs == 0) {
      delete this.bodyMs;
    }
    if (this.tailMs == 0) {
      delete this.tailMs;
    }
    this.meta = props.meta ?? this.meta;
  }

  abstract renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    pxPerDegree: number,
    ageSeconds: number
  ): void;

  // Animate used only for live on-screen context (concrete method)
  preview(ctx: CanvasRenderingContext2D, onAllFramesDone?: () => void) {
    let lastTimestamp = 0;
    const animate = (newTimestamp: number): void => {
      if (!lastTimestamp) {
        lastTimestamp = newTimestamp;
      }
      const ageSeconds = (newTimestamp - lastTimestamp) / 1000; // Seconds
      const approxPxPerDegree = // Based on current window relative to final display
        (diagonalLength(ctx) * displays.SD1.pxPerDegree) /
        Math.sqrt(displays.SD1.height ** 2 + displays.SD1.width ** 2);
      if (ageSeconds < this.durationMs / 1000) {
        this.renderFrame(ctx, approxPxPerDegree, ageSeconds);
        requestAnimationFrame(animate);
      } else {
        if (onAllFramesDone) {
          onAllFramesDone();
        }
      }
    };
    requestAnimationFrame(animate);
  }
}

// Returns head, body, tail that must add up to duration
function calculateDurations(
  duration: number,
  head?: number,
  body?: number,
  tail?: number
): [number, number, number] {
  const defined = (head ? '1' : '0') + (body ? '1' : '0') + (tail ? '1' : '0');
  duration = Math.max(TONE_DURATION_MS, duration); // Leave room for sync tones
  roundToValidDuration(duration); // Round to nearest 20ms
  switch (defined) {
    case '000': // All durations are undefined
      return [0, duration, 0];

    case '001': // Only tail is defined
      assert(
        tail! <= duration,
        `tail greater than duration  tail=${tail} duration=${duration}`
      );
      return [0, duration - tail!, tail!];

    case '010': // Only body is defined
      assert(
        body! <= duration,
        `body greater than duration body=${body} duration=${duration}`
      );
      return [0, body!, duration - body!];

    case '011': // Body and tail are defined
      assert(
        body! + tail! <= duration,
        `body+tail greater than duration body=${body} tail=${tail} duration=${duration}`
      );
      return [0, body!, tail!];

    case '100': // Only head is defined
      assert(head! <= duration, 'head greater than duration');
      return [head!, duration - head!, 0];

    case '101': // Head and tail are defined
      assert(head! + tail! <= duration, 'head+tail greater than duration');
      return [head!, duration - head! - tail!, tail!];

    case '110': // Head and body are defined
      assert(head! + body! <= duration, 'head+body greater than duration');
      return [head!, body!, duration - head! - body!];

    case '111': // All durations are defined
      assert(
        head! + body! + tail! <= duration,
        'head+body+tail greater than duration'
      );
      return [head!, body!, tail!];

    default:
      throw new Error('Invalid duration configuration');
  }
}
