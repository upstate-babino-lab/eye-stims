import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '../render-utils';
import { newAssay } from '@src/assays';
import { useAppState } from '../StateContext';

export function AssayBooleanCheckbox(props: {
  label: string;
  propName: string;
  toolTip?: string;
}) {
  const { theAssay, setTheAssay } = useAppState();

  return (
    <>
      <div
        className="mb-1 flex items-center w-50"
        data-tooltip-id={props.propName + '-id'}
        data-tooltip-content={props.toolTip}
        data-tooltip-place="right"
      >
        <label className="text-sm font-bold text-gray-100 px-4">
          {props.label}:
        </label>
        <input
          type="checkbox"
          // TODO?: restyle using Tailwind’s peer utility
          className="h-4 w-4 border border-gray-500 rounded-xl text-gray-200 bg-transparent checked:bg-current"
          checked={theAssay ? theAssay[props.propName] : false}
          onChange={(e) => {
            const newValue = !!e.target.checked;
            const newStruct = newAssay({ ...theAssay });
            newStruct[props.propName] = newValue;
            setTheAssay(newStruct);
          }}
        />
      </div>
      <Tooltip id={props.propName + '-id'} className={TOOLTIP_STYLES} />
    </>
  );
}
