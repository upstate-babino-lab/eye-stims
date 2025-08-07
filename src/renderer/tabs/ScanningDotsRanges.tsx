import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { RangeSpec } from '@src/assays';
import {
  ScanningDotsAssay,
  maxXDegrees,
  maxYDegrees,
} from '@src/assays/ScanningDotsAssay';

export function ScanningDotsRanges() {
  const { theAssay, setTheAssay } = useAppState();
  const { diameters, xDegrees, yDegrees } = theAssay as ScanningDotsAssay;

  if (!theAssay || !(theAssay instanceof ScanningDotsAssay)) {
    return (
      <div className="text-red-500">No valid ScanningDotsAssay available</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSpecForm
        title="Diameters"
        toolTip="Degrees of visual angle"
        onUpdate={(diameters: RangeSpec) => {
          setTheAssay(
            new ScanningDotsAssay({
              ...theAssay,
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
          setTheAssay(
            new ScanningDotsAssay({
              ...theAssay,
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
          setTheAssay(
            new ScanningDotsAssay({
              ...theAssay,
              yDegrees: yDegrees,
            })
          );
        }}
        initialRange={yDegrees}
      />
    </div>
  );
}
