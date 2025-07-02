import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@src/specs';
import {
  ScanningDotStimsSpec,
  maxXDegrees,
  maxYDegrees,
} from '@src/specs/ScanningDotStimsSpec';

export function ScanningDotRanges() {
  const { theStimsSpec, setTheStimsSpec } = useAppState();
  const { diameters, xDegrees, yDegrees } = theStimsSpec as ScanningDotStimsSpec;

  if (!theStimsSpec || !(theStimsSpec instanceof ScanningDotStimsSpec)) {
    return (
      <div className="text-red-500">No valid ScanningDotStimsSpec available</div>
    );
  }

  return (
    <div>
      <RangeSpecForm
        title="Diameters"
        toolTip="Degrees of visual angle"
        onUpdate={(diameters: RangeSpec) => {
          setTheStimsSpec(
            new ScanningDotStimsSpec({
              ...theStimsSpec,
              diameters: diameters,
            })
          );
        }}
        initialRange={diameters}
      />
      <RangeSpecForm
        title="xDegrees"
        toolTip={`Horizontal degrees of visual angle starting from left (max ~${maxXDegrees})`}
        onUpdate={(xDegrees: RangeSpec) => {
          // console.log('>>>>> xDegrees=' + JSON.stringify(xDegrees));
          setTheStimsSpec(
            new ScanningDotStimsSpec({
              ...theStimsSpec,
              xDegrees: xDegrees,
            })
          );
        }}
        initialRange={xDegrees}
      />
      <RangeSpecForm
        title="yDegrees"
        toolTip={`Vertical degrees of visual angle starting from top (max ~${maxYDegrees})`}
        onUpdate={(yDegrees: RangeSpec) => {
          // console.log('>>>>> yDegrees=' + JSON.stringify(yDegrees));
          setTheStimsSpec(
            new ScanningDotStimsSpec({
              ...theStimsSpec,
              yDegrees: yDegrees,
            })
          );
        }}
        initialRange={yDegrees}
      />
    </div>
  );
}
