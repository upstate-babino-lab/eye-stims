import { RangeSpec, SqrGratingAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '@renderer/render-utils';

export function GratingRanges() {
  const { theAssay: theStimsSpec, setTheAssay: setTheStimsSpec } = useAppState();
  const { cpds, contrasts, speeds, includeStaticGratings } =
    theStimsSpec as SqrGratingAssay;

  if (!theStimsSpec || !(theStimsSpec instanceof SqrGratingAssay)) {
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
            new SqrGratingAssay({
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
            new SqrGratingAssay({
              ...theStimsSpec,
              contrasts: contrasts,
            })
          );
        }}
        initialRange={contrasts}
        min={0}
        max={100}
      />
      <RangeSpecForm
        title="Speeds"
        toolTip="Degrees per second"
        onUpdate={(speeds: RangeSpec) => {
          // console.log('>>>>> speeds=' + JSON.stringify(speeds));
          setTheStimsSpec(
            new SqrGratingAssay({
              ...theStimsSpec,
              speeds: speeds,
            })
          );
        }}
        initialRange={speeds}
      />
      <>
        <div
          className="mb-1 flex items-center w-50"
          data-tooltip-id={'add-static-gratings-id'}
          data-tooltip-content={'Add third grating to each pair with speed 0'}
          data-tooltip-place="right"
        >
          <label className="text-sm font-bold text-gray-100 px-4">
            Add static gratings:
          </label>
          <input
            type="checkbox"
            // TODO: restyle using Tailwind’s peer utility
            className="h-4 w-4 border border-gray-500 rounded-xl text-gray-200 bg-transparent checked:bg-current"
            checked={includeStaticGratings}
            onChange={(e) => {
              setTheStimsSpec(
                new SqrGratingAssay({
                  ...theStimsSpec,
                  includeStaticGratings: !!e.target.checked,
                })
              );
            }}
          />
        </div>
        <Tooltip id={'add-static-gratings-id'} className={TOOLTIP_STYLES} />
      </>
    </div>
  );
}
