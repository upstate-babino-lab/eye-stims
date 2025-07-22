import { ParadigmType } from './Paradigm';
import type { Paradigm, ParadigmProps } from './Paradigm';
import { SqrGratingParadigm } from './SqrGratingParadigm';
import { ScanningDotParadigm } from './ScanningDotParadigm';
import { FullFieldSineParadigm } from './FullFieldSineParadigm';

// Map of constructors that create new StimsSpec class objects (with methods)
// from simple parsed JSON POJOs (with no methods) using lookup by name.
// Every possible ParadigmType must be assigned or thankfully, Typescript complains.
type ParadigmConstructors = {
  [key in ParadigmType]: new (args: Partial<ParadigmProps>) => Paradigm;
};
export const paradigmConstructors: ParadigmConstructors = {
  SqrGratingPairs: SqrGratingParadigm,
  ScanningDot: ScanningDotParadigm,
  FullFieldSine: FullFieldSineParadigm,
};

// Create a new Paradigm class instance from POJO or parsed JSON object.
export function newParadigm(paradigm: Partial<Paradigm>): Paradigm {
  if (!paradigm.paradigmType) {
    throw new Error(`newParadigm(): Missing paradigmType`);
  }
  const isValidStimType =
    paradigm && Object.values(ParadigmType).includes(paradigm.paradigmType);
  if (!isValidStimType) {
    throw new Error(
      `newParadigm(): paradigmType '${paradigm.paradigmType}' not found`
    );
  }
  const constructor = paradigmConstructors[paradigm.paradigmType];
  return new constructor(paradigm);
}
