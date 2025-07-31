import { TONE_DURATION_MS } from '../constants';
import { Solid } from '.';
import { StimType, Stimulus } from './Stimulus';

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function vmin(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  return Math.min(width, height);
}

// Like CSS viewport maximum
export function vmax(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  return Math.max(width, height);
}

/*
export function vminsToPx(
  vmins: number,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  return Math.round((vmins / 100) * vmin(ctx));
}

export function logMARtoPx(logMAR: number, pxPerDegree: number): number {
  const degrees = Math.pow(10, logMAR) / 60;
  return Math.round(degrees * pxPerDegree);
}
*/

export function diagonalLength(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  return Math.sqrt(ctx.canvas.width ** 2 + ctx.canvas.height ** 2);
}

export function colorToRGB(cssColor: string): { r: number; g: number; b: number } {
  const canvas = new OffscreenCanvas(1, 1);
  if (!canvas) {
    throw new Error('colorToRGB() got invalid OffscreenCanvas');
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('colorToRGB() got invalid context from canvas');
  }

  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const colorData = ctx.getImageData(0, 0, 1, 1).data;

  return {
    r: colorData[0],
    g: colorData[1],
    b: colorData[2],
  };
}

export function rgbToHex(rgb: { r: number; g: number; b: number }) {
  return (
    '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
  );
}

export function linearToHex(r: number, g: number, b: number): string {
  if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
    throw new Error(`linearToHex() got r=${r}, g=${g}, b=${b}, expected 0-1`);
  }
  return '#' + lToHex(r) + lToHex(g) + lToHex(b);
}

function lToHex(f: number) {
  if (f < 0 || f > 1) {
    throw new Error(`lToHex() got ${f}, expected 0-1`);
  }
  const GAMMA = 2.2; // TODO retrieve from selected display
  // Gamma compress linear light intensity between zero and one
  const n = Math.round(Math.pow(f, 1 / GAMMA) * 255);
  let hex = '';
  if (n < 10) {
    hex = '0';
  }
  return hex + n.toString(16);
}

// Michelson contrast (max-min)/(max+min) range 0% to 100%
export function contrastPair(
  contrastPercent: number,
  meanIntensityPercent: number = 50
) {
  // Convert to fraction in range 0-1
  const contrastF = Math.max(0, Math.min(contrastPercent / 100, 1.0));
  const meanF = Math.max(
    0,
    Math.min(meanIntensityPercent / 100, 1 / (1 + contrastF))
  );

  const min = meanF * (1 - contrastF);
  const max = meanF * (1 + contrastF);
  return [min, max].map((c) => linearToHex(c, c, c));
}

// Contrast values from eye-candy
//  0   is max contrast (black & white)
// -2.2 is minimal contrast
export function oldContrastPair(logContrast: number) {
  return logContrastToLinearPair(logContrast).map((c) => linearToHex(c, c, c));
}

// Returns a pair of linear luminance values, 0-1, for the given log contrast
export function logContrastToLinearPair(logC: number) {
  const c = Math.pow(10, logC) / 2;
  return [0.5 + c, 0.5 - c];
}

// Add initial and final black if necessary to ensure video starts with a black frame, and
// to avoid final encoding glitches with a/v synchronization
export function frameWithBlack(stims: Stimulus[]): Stimulus[] {
  const lastStim = stims?.at(-1);
  if (lastStim?.stimType != StimType.Solid || lastStim.bgColor != 'black') {
    stims?.push(
      new Solid({
        durationMs: TONE_DURATION_MS,
        meta: { comment: 'final black' },
      })
    );
  }

  // Add initial black if necessary, so paused video about to play is black,
  // and sync-tone plays on first visible stim.
  // Minimum duration is 10 seconds to give player time to shut off text and borders
  const firstStim = stims[0];
  if (
    firstStim?.stimType != StimType.Solid ||
    firstStim.bgColor != 'black' ||
    firstStim.durationMs < 10_000
  ) {
    stims?.unshift(
      new Solid({
        durationMs: 10_000,
        meta: { comment: 'initial black' },
      })
    );
  }
  return stims;
}

//-----------------------------------------------------------------------------
// In-place
export function shuffle(stims: Stimulus[]): Stimulus[] {
  return stims.sort(() => Math.random() - 0.5);
}

//-----------------------------------------------------------------------------
export function addIntegrityFlashes(
  stims: Stimulus[],
  intervalMins: number = 0 // optional interval between start and end
): Stimulus[] {
  const integrityFlashGroup = [
    new Solid({
      bgColor: 'oklch(0.5 0 0)',
      durationMs: 1260,
      bodyMs: 260,
      meta: { comment: 'integrity flash' },
    }), // Perceptually gray
    new Solid({
      bgColor: 'red',
      durationMs: 1260,
      bodyMs: 260,
      meta: { comment: 'integrity flash' },
    }),
    new Solid({
      bgColor: 'green',
      durationMs: 1260,
      bodyMs: 260,
      meta: { comment: 'integrity flash' },
    }),
    new Solid({
      bgColor: 'blue',
      durationMs: 1260,
      bodyMs: 260,
      meta: { comment: 'integrity flash' },
    }),
  ];

  // Required integrity flashes at start
  let result: Stimulus[] = [...integrityFlashGroup, ...stims];

  // Insert optional integrity flashes at intervals
  if (intervalMins && intervalMins > 0 && integrityFlashGroup.length > 0) {
    result = insertAtIntervals(result, intervalMins, integrityFlashGroup);
  }

  // Required integrity flashes at end
  result = [...result, ...integrityFlashGroup];

  return result;
}

//-----------------------------------------------------------------------------
export function addRestPeriods(
  stims: Stimulus[],
  intervalMins: number,
  restDurationMins: number
): Stimulus[] {
  if (intervalMins <= 0 || restDurationMins <= 0) {
    return stims; // No rest periods to add
  }

  const oneMinuteRest = new Solid({
    bgColor: 'black',
    durationMs: 60 * 1000,
    meta: { comment: `rest` },
  });

  return insertAtIntervals(
    stims,
    intervalMins,
    Array(Math.round(restDurationMins)).fill(oneMinuteRest)
  );
}

//-----------------------------------------------------------------------------
export function insertAtIntervals(
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
