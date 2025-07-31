import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@src/paradigms';
import {
  ScanningDotParadigm,
  maxXDegrees,
  maxYDegrees,
} from '@src/paradigms/ScanningDotParadigm';

export function ScanningDotRanges() {
  const { theParadigm, setTheParadigm } = useAppState();
  const { diameters, xDegrees, yDegrees } = theParadigm as ScanningDotParadigm;

  if (!theParadigm || !(theParadigm instanceof ScanningDotParadigm)) {
    return (
      <div className="text-red-500">No valid ScanningDotParadigm available</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSpecForm
        title="Diameters"
        toolTip="Degrees of visual angle"
        onUpdate={(diameters: RangeSpec) => {
          setTheParadigm(
            new ScanningDotParadigm({
              ...theParadigm,
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
          setTheParadigm(
            new ScanningDotParadigm({
              ...theParadigm,
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
          setTheParadigm(
            new ScanningDotParadigm({
              ...theParadigm,
              yDegrees: yDegrees,
            })
          );
        }}
        initialRange={yDegrees}
      />
    </div>
  );
}
