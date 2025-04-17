/* eslint-disable prefer-const */
//const metadata = { name: 'grating-sinusoidal-contrast', version: '0.1.0' };

import './epl-shims';
import { NestedStimuli, stims, r } from './epl-shims';

let repetitions = 25;
let durations = [1];
// 0 is 1 (max) contrast, -1 is 0.1 contrast, -2 is 0.01
// -2.2 is minimal contrast, <=-2.3 is same color for 8 bit color
let startLogContrast = 0;
let logContrastStep = -0.1;
let ncontrasts = 5;
let angles = [Math.PI / 4];
let speed = 100;
let nsizes = 6;

let startLogMAR = 1.8;
let logMarStep = 0.2;

function linearToHex(f) {
  // gamma compress linear light intensity between zero and one
  let n = Math.round(Math.pow(f, 1 / 2.2) * 255);
  let hex = '';
  if (n < 10) {
    hex = '0';
  }
  hex = hex + n.toString(16);
  return '#' + hex + hex + hex;
}

function logContrastToLinear(logC) {
  let c = Math.pow(10, logC) / 2;
  return [0.5 + c, 0.5 - c];
}

function logMARtoPx(logMAR, pxPerDegree = 12.524) {
  let degrees = 10 ** logMAR / 60;
  return Math.round(degrees * pxPerDegree);
}

function inverseAngle(angle: number) {
  return (angle + Math.PI) % (2 * Math.PI);
}

let sizes = [...Array(nsizes).keys()]
  .map((x) => x * logMarStep + startLogMAR)
  .map((x) => logMARtoPx(x));

let colors = [...Array(ncontrasts).keys()]
  .map((x) => x * logContrastStep + startLogContrast)
  .map((logC) => logContrastToLinear(logC).map((c) => linearToHex(c)));

let stimuli: NestedStimuli = [];
let left;
let right;
let before;
let after;
let id;
let cohort;

for (let size of sizes) {
  for (let angle of angles) {
    for (let colorPair of colors) {
      for (let duration of durations) {
        for (let i = 0; i < repetitions; i++) {
          id = r.uuid();
          before = new stims.Solid({ duration: 1, meta: { group: id } });

          left = new stims.SinusoidalGrating({
            duration: duration,
            bgColor: colorPair[0],
            speed: speed,
            width: size,
            angle: angle,
            fgColor: colorPair[1],
            meta: { group: id, cohort: cohort, class: 'FORWARD', block: true },
          });
          after = new stims.Solid({
            duration: r.randi(60, 75) / 60,
            meta: { group: id, block: true },
          });
          stimuli.push([before, left, after]);

          id = r.uuid();
          right = new stims.SinusoidalGrating({
            duration: duration,
            bgColor: colorPair[0],
            speed: speed,
            width: size,
            angle: inverseAngle(angle),
            fgColor: colorPair[1],
            meta: { group: id, cohort: cohort, class: 'REVERSE', block: true },
          });
          after = new stims.Solid({
            duration: r.randi(60, 75) / 60,
            meta: { group: id, block: true },
          });
          stimuli.push([before, right, after]);
        }
      }
    }
  }
}

r.shuffle(stimuli); // Shuffle groups [before, grating, after ]
stimuli = stimuli.flat();
