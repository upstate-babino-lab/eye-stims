import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@src/assays';
import { FullFieldSinesAssay } from '@src/assays/FullFieldSinesAssay';

export function FullFieldSinesSubform() {
  const { theAssay, setTheAssay } = useAppState();
  const { means, mContrasts, frequencies } = theAssay as FullFieldSinesAssay;

  if (!theAssay || !(theAssay instanceof FullFieldSinesAssay)) {
    return (
      <div className="text-red-500">No valid FullFieldSinesAssay available</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSpecForm
        title="Mean intensities %"
        toolTip="Mean luminance with range 0% to 1/(1+contrast)"
        onUpdate={(means: RangeSpec) => {
          setTheAssay(
            new FullFieldSinesAssay({
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
            new FullFieldSinesAssay({
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
            new FullFieldSinesAssay({
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
