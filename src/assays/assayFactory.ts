import { AssayType } from './Assay';
import type { Assay, AssayProps } from './Assay';
import { SqrGratingAssay } from './SqrGratingAssay';
import { ScanningDotAssay } from './ScanningDotAssay';
import { FullFieldSineAssay } from './FullFieldSineAssay';

// Map of constructors that create new StimsSpec class objects (with methods)
// from simple parsed JSON POJOs (with no methods) using lookup by name.
// Every possible AssayType must be assigned or thankfully, Typescript complains.
type AssayConstructors = {
  [key in AssayType]: new (args: Partial<AssayProps>) => Assay;
};
export const assayConstructors: AssayConstructors = {
  SqrGratingPairs: SqrGratingAssay,
  ScanningDot: ScanningDotAssay,
  FullFieldSine: FullFieldSineAssay,
};

// Create a new Assay class instance from POJO or parsed JSON object.
export function newAssay(assay: Partial<Assay>): Assay {
  if (!assay.assayType) {
    throw new Error(`newAssay(): Missing assayType`);
  }
  const isValidStimType =
    assay && Object.values(AssayType).includes(assay.assayType);
  if (!isValidStimType) {
    throw new Error(`newAssay(): assayType '${assay.assayType}' not found`);
  }
  const constructor = assayConstructors[assay.assayType];
  return new constructor(assay);
}
