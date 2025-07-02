import { RangeSpec, SqrGratingStimsSpec } from '@src/specs';
import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '@renderer/render-utils';

export function GratingRanges() {
  const { theStimsSpec, setTheStimsSpec } = useAppState();
  const { cpds, contrasts, speeds, includeStaticGratings } =
    theStimsSpec as SqrGratingStimsSpec;

  if (!theStimsSpec || !(theStimsSpec instanceof SqrGratingStimsSpec)) {
    return (
      <div className="text-red-500">No valid SqrGratingStimsSpec available</div>
    );
  }

  return (
    <div>
      <RangeSpecForm
        title="Cycles per degree"
        toolTip="One dark and one light bar make one cycle"
        onUpdate={(cpds: RangeSpec) => {
          // console.log('>>>>> cpds=' + JSON.stringify(cpds));
          setTheStimsSpec(
            new SqrGratingStimsSpec({
              ...theStimsSpec,
              cpds: cpds,
            })
          );
        }}
        initialRange={cpds}
      />
      <RangeSpecForm
        title="Contrasts"
        toolTip="LogContrast of 0 is max (black & white), -2.2 is minimal contrast"
        onUpdate={(contrasts: RangeSpec) => {
          // console.log('>>>>> contrasts=' + JSON.stringify(contrasts));
          setTheStimsSpec(
            new SqrGratingStimsSpec({
              ...theStimsSpec,
              contrasts: contrasts,
            })
          );
        }}
        initialRange={contrasts}
      />
      <RangeSpecForm
        title="Speeds"
        toolTip="Degrees per second"
        onUpdate={(speeds: RangeSpec) => {
          // console.log('>>>>> speeds=' + JSON.stringify(speeds));
          setTheStimsSpec(
            new SqrGratingStimsSpec({
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
                new SqrGratingStimsSpec({
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
