import { assert } from '../shared-utils';

export enum StimType {
  Uninitialized = 'Uninitialized',
  Solid = 'Solid',
  Bar = 'Bar',
  SinGrating = 'SinGrating',
  SqrGrating = 'SqrGrating',
}

// Make sure durations align with 50fps frame rate
// (multiples of 20 milliseconds)
export function roundToNearestTwenty(num: number): number {
  return Math.round(num / 20) * 20;
}

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
  durationMs: number = 10_000; // Required, multiple of 20
  bgColor: string = 'black';
  // Head, body and tail are optional, but must sum to duration
  // By default head and tail are 0 and body is full duration
  headMs?: number; // Duration of black before body
  bodyMs?: number; // Duration between head and tail, multiple of 20
  tailMs?: number; // Duration of black after body
  meta?: Record<string, unknown> = {};
  _videoCacheFilename?: string;
  _silentCacheFilename?: string;
  constructor(props: StimProps) {
    // console.log(`>>>>> constructor abstract Stimulus(${name}, ${duration} ${bgColor})`);
    this.stimType = props.stimType;
    this.durationMs = roundToNearestTwenty(props.durationMs ?? this.durationMs);
    this.bgColor = props.bgColor ?? this.bgColor;
    [this.headMs, this.bodyMs, this.tailMs] = calculateDurations(
      this.durationMs,
      props.headMs,
      props.bodyMs,
      props.tailMs
    );
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
      if (ageSeconds < this.durationMs / 1000) {
        this.renderFrame(ctx, 12, ageSeconds); // Unknown pxPerDegree on user's screen
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

function calculateDurations(
  duration: number,
  head?: number,
  body?: number,
  tail?: number
): [number, number, number] {
  const defined = (head ? '1' : '0') + (body ? '1' : '0') + (tail ? '1' : '0');
  switch (defined) {
    case '000': // All durations are undefined
      return [0, duration, 0];

    case '001': // Only tail is defined
      assert(tail! <= duration, 'tail greater than duration');
      return [0, duration - tail!, tail!];

    case '010': // Only body is defined
      assert(body! <= duration, 'body greater than duration');
      return [0, body!, duration - body!];

    case '011': // Body and tail are defined
      assert(body! + tail! <= duration, 'body+tail greater than duration');
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
