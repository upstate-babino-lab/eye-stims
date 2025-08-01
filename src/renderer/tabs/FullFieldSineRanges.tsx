import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@src/paradigms';
import { FullFieldSineParadigm } from '@src/paradigms/FullFieldSineParadigm';

export function FullFieldSineRanges() {
  const { theParadigm, setTheParadigm } = useAppState();
  const { means, mContrasts, frequencies } = theParadigm as FullFieldSineParadigm;

  if (!theParadigm || !(theParadigm instanceof FullFieldSineParadigm)) {
    return (
      <div className="text-red-500">No valid FullFieldSineParadigm available</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSpecForm
        title="Mean intensities %"
        toolTip="Mean luminance with range 0% to 1/(1+contrast)"
        onUpdate={(means: RangeSpec) => {
          setTheParadigm(
            new FullFieldSineParadigm({
              ...theParadigm,
              means: means,
            })
          );
        }}
        initialRange={means}
        min={0}
        max={100}
      />
      <RangeSpecForm
        title="Contrasts %"
        toolTip={`Michelson contrast (max-min)/(max+min) range 0% to 100%`}
        onUpdate={(mContrasts: RangeSpec) => {
          // console.log('>>>>> xDegrees=' + JSON.stringify(xDegrees));
          setTheParadigm(
            new FullFieldSineParadigm({
              ...theParadigm,
              mContrasts: mContrasts,
            })
          );
        }}
        initialRange={mContrasts}
        min={0}
        max={100}
      />
      <RangeSpecForm
        title="Frequencies Hz"
        toolTip={`Cycles per second`}
        onUpdate={(frequencies: RangeSpec) => {
          // console.log('>>>>> frequencies=' + JSON.stringify(frequencies));
          setTheParadigm(
            new FullFieldSineParadigm({
              ...theParadigm,
              frequencies: frequencies,
            })
          );
        }}
        initialRange={frequencies}
      />
    </div>
  );
}
