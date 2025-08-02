import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@src/assays';
import { FullFieldSineAssay } from '@src/assays/FullFieldSineAssay';

export function FullFieldSineRanges() {
  const { theAssay, setTheAssay } = useAppState();
  const { means, mContrasts, frequencies } = theAssay as FullFieldSineAssay;

  if (!theAssay || !(theAssay instanceof FullFieldSineAssay)) {
    return (
      <div className="text-red-500">No valid FullFieldSineAssay available</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSpecForm
        title="Mean intensities %"
        toolTip="Mean luminance with range 0% to 1/(1+contrast)"
        onUpdate={(means: RangeSpec) => {
          setTheAssay(
            new FullFieldSineAssay({
              ...theAssay,
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
          setTheAssay(
            new FullFieldSineAssay({
              ...theAssay,
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
          setTheAssay(
            new FullFieldSineAssay({
              ...theAssay,
              frequencies: frequencies,
            })
          );
        }}
        initialRange={frequencies}
      />
    </div>
  );
}
