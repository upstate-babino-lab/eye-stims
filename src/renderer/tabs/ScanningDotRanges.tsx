import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@paradigms';
import {
  ScanningDotParadigm,
  maxXDegrees,
  maxYDegrees,
} from '@src/paradigms/ScanningDotParadigm';

export function ScanningDotRanges() {
  const { theParadigm: theStimsSpec, setTheParadigm: setTheStimsSpec } = useAppState();
  const { diameters, xDegrees, yDegrees } = theStimsSpec as ScanningDotParadigm;

  if (!theStimsSpec || !(theStimsSpec instanceof ScanningDotParadigm)) {
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
            new ScanningDotParadigm({
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
            new ScanningDotParadigm({
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
            new ScanningDotParadigm({
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
