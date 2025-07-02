import { StimSpecType } from './StimsSpec';
import type { StimsSpec, StimsSpecProps } from './StimsSpec';
import { SqrGratingStimsSpec } from './SqrGratingStimsSpec';
import { ScanningDotStimsSpec } from './ScanningDotStimsSpec';

// Map of constructors that create new StimsSpec class objects (with methods)
// from simple parsed JSON POJOs (with no methods) using lookup by name.
// Every possible StimSpecType must be assigned or thankfully, Typescript complains.
type StimsSpecConstructors = {
  [key in StimSpecType]: new (args: Partial<StimsSpecProps>) => StimsSpec;
};
export const stimsSpecConstructors: StimsSpecConstructors = {
  SqrGratingPairs: SqrGratingStimsSpec,
  ScanningDot: ScanningDotStimsSpec,
};

// Create a new StimsSpec class instance from POJO or parsed JSON object.
export function newStimSpec(stimSpec: Partial<StimsSpec>): StimsSpec {
  if (!stimSpec.stimSpecType) {
    throw new Error(`newStimSpec(): Missing stimSpecType`);
  }
  const isValidStimType =
    stimSpec && Object.values(StimSpecType).includes(stimSpec.stimSpecType);
  if (!isValidStimType) {
    throw new Error(
      `newStimSpec(): StimSpecType '${stimSpec.stimSpecType}' not found`
    );
  }
  const constructor = stimsSpecConstructors[stimSpec.stimSpecType];
  return new constructor(stimSpec);
}
