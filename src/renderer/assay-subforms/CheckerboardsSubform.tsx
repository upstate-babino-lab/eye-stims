import { RangeSpec, CheckerboardsAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';

export function CheckerboardsSubform() {
  const { theAssay, setTheAssay } = useAppState();
  const { cpds, contrasts } = theAssay as CheckerboardsAssay;

  if (!theAssay || !(theAssay instanceof CheckerboardsAssay)) {
    return (
      <div className="text-red-500">No valid CheckerboardsAssay available</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <RangeSpecForm
        title="Cycles per degree"
        toolTip="One dark and one light bar make one cycle"
        onUpdate={(cpds: RangeSpec) => {
          // console.log('>>>>> cpds=' + JSON.stringify(cpds));
          setTheAssay(
            new CheckerboardsAssay({
              ...theAssay,
              cpds: cpds,
            })
          );
        }}
        initialRange={cpds}
      />
      <RangeSpecForm
        title="Contrasts"
        toolTip={`Michelson contrast (max-min)/(max+min) range 0% to 100%`}
        onUpdate={(contrasts: RangeSpec) => {
          // console.log('>>>>> contrasts=' + JSON.stringify(contrasts));
          setTheAssay(
            new CheckerboardsAssay({
              ...theAssay,
              contrasts: contrasts,
            })
          );
        }}
        initialRange={contrasts}
        min={0}
        max={100}
      />
    </div>
  );
}
