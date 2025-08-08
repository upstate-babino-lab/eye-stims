import { RangeSpec, CheckerboardsAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';

export function CheckerboardsRanges() {
  const { theAssay: theStimsSpec, setTheAssay: setTheStimsSpec } = useAppState();
  const { cpds, contrasts } = theStimsSpec as CheckerboardsAssay;

  if (!theStimsSpec || !(theStimsSpec instanceof CheckerboardsAssay)) {
    return (
      <div className="text-red-500">No valid SqrGratingStimsSpec available</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <RangeSpecForm
        title="Cycles per degree"
        toolTip="One dark and one light bar make one cycle"
        onUpdate={(cpds: RangeSpec) => {
          // console.log('>>>>> cpds=' + JSON.stringify(cpds));
          setTheStimsSpec(
            new CheckerboardsAssay({
              ...theStimsSpec,
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
          setTheStimsSpec(
            new CheckerboardsAssay({
              ...theStimsSpec,
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
