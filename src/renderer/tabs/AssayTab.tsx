import Button from '@renderer/components/Button';
import { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { saveFileDialogAsync } from '@renderer/render-utils';
import { useAppState } from '@renderer/StateContext';
import { useEffect, useState } from 'react';
import { filterPrivateAndNullProperties } from '@src/shared-utils';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '@renderer/render-utils';
import StimSequence from '../StimSequence';
import {
  newAssay,
  AssayType,
  assaysInfo,
  SqrGratingAssay,
  ScanningDotsAssay,
  FullFieldSinesAssay,
  CheckerboardsAssay,
  LettersAssay,
  ImagesAssay,
} from '@src/assays/index';
import {
  GratingsSubform,
  ScanningDotsSubform,
  FullFieldSinesSubform,
  CheckerboardsSubform,
  LettersSubform,
  ImagesSubform,
  AssayBooleanCheckbox,
  AssayTwoPropsForm,
} from '../assay-subforms/index';
import 'react-tooltip/dist/react-tooltip.css';

export default function AssayTab() {
  const { theAssay, setTheAssay } = useAppState();
  const { theStimsMeta, setTheStimsMeta } = useAppState();
  const { setTheStimSequence } = useAppState();

  useEffect(() => {
    // TODO?: Calculate count and duration without creating a StimSequence
    if (theAssay) {
      const stimSeq = new StimSequence(theAssay.stimuli());
      setTheStimSequence(stimSeq);
      setTheStimsMeta({
        ...theStimsMeta,
        title: theAssay?.title,
        description: theAssay?.description,
        count: stimSeq?.stimuli.length || 0,
        totalDurationMS: stimSeq?.duration(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theAssay, setTheStimsMeta]);

  if (!theAssay) {
    return <div></div>;
  }

  return (
    <div className="flex flex-row items-start p-4 bg-gray-900 -mx-4">
      <div className="flex flex-col w-130 gap-0.5">
        <div className="mb-3 flex items-center w-full">
          <label className="text-sm font-bold text-gray-100 px-4">Title:</label>
          <input
            type="text"
            className={INPUT_STYLES + ' w-full'}
            value={theAssay?.title}
            onChange={(e) => {
              setTheAssay(
                newAssay({
                  ...theAssay,
                  title: e.target.value,
                })
              );
            }}
          />
        </div>
        <div className="mb-3 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Description:
          </label>
          <input
            type="text"
            className={INPUT_STYLES + ' w-full'}
            value={theAssay?.description}
            onChange={(e) => {
              setTheAssay(
                newAssay({
                  ...theAssay,
                  description: e.target.value,
                })
              );
            }}
          />
        </div>
        <div className="mb-3 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            AssayType:
          </label>
          <AssayTypePulldown
            initialValue={theAssay?.assayType || AssayType.SqrGratingPairs}
            onChange={(newType: AssayType) => {
              console.log('>>>>> AssayType changed to ' + newType);
              setTheAssay(
                newAssay({
                  ...theAssay,
                  assayType: newType,
                  description: assaysInfo[newType].description,
                })
              );
            }}
          />
        </div>
        <AssayTwoPropsForm
          nameA="bodyMs"
          nameB="tailMs"
          toolTip="Each stimulus body is followed by full-field black or colored tail (multiples of 20ms)"
        />
        <AssayBooleanCheckbox
          label="Mean-colored Tails"
          propName="colorTails"
          toolTip="Color tails with mean of last 200ms of center 25% of each body (instead of solid black)"
        />
        <div className="border border-gray-500 rounded-md p-1">
          <AssaySubForm />
        </div>
        <div className="mb-1 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Repetitions:
          </label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theAssay?.nRepetitions ? theAssay?.nRepetitions : 0}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheAssay(
                newAssay({
                  ...theAssay,
                  nRepetitions: newValue,
                })
              );
            }}
            min={1}
            max={100}
            step={1}
          />
        </div>
        <AssayBooleanCheckbox
          label="Shuffle stimuli"
          propName="doShuffle"
          toolTip="Randomize order of all stimuli (except integrity flashes and rests)"
        />
        <>
          <div
            className="mb-1 flex items-center w-90"
            data-tooltip-id={'integrity-flash-id'}
            data-tooltip-content={
              'Gray,red,green,blue flashes are optional at interval, but required at start and end'
            }
            data-tooltip-place="right"
          >
            <label className="text-sm font-bold text-gray-100 px-4">
              Integrity flashes interval (mins):
            </label>
            <input
              type="number"
              className={INPUT_STYLES}
              value={
                theAssay?.integrityFlashIntervalMins
                  ? theAssay?.integrityFlashIntervalMins
                  : 0
              }
              onChange={(e) => {
                const newValue =
                  e.target.value === '' ? undefined : parseFloat(e.target.value);
                setTheAssay(
                  newAssay({
                    ...theAssay,
                    integrityFlashIntervalMins: newValue,
                  })
                );
              }}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <Tooltip id={'integrity-flash-id'} className={TOOLTIP_STYLES} />
        </>
        <AssayTwoPropsForm
          nameA="restIntervalMins"
          nameB="restDurationMins"
          toolTip="How often and how long to rest with solid black"
        />
      </div>

      <div className="flex flex-col gap-2 ml-auto">
        <Button
          className="ml-auto"
          onClick={async () => {
            const filePath = await saveFileDialogAsync(
              (theAssay?.title.toLowerCase() || 'untitled') + '.assay.json'
            );
            setTheStimsMeta({ ...theStimsMeta, loadedPath: filePath });
            const content = JSON.stringify(
              {
                appVersion: await window.electron.getAppVersionAsync(),
                ...theAssay,
              },
              filterPrivateAndNullProperties,
              4
            );
            window.electron.send('saveFile', {
              filePath: filePath,
              content: content,
            });
          }}
        >
          Save Assay
        </Button>
      </div>
    </div>
  );
}

//-----------------------------------------------------------------------------
function AssayTypePulldown(props: {
  initialValue: AssayType;
  onChange: (value: AssayType) => void;
}) {
  const [selectedValue, setSelectedValue] = useState(props.initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedValue(AssayType[newValue]);
    props.onChange(AssayType[newValue]);
  };

  return (
    <div className="inline-flex">
      <select value={selectedValue} onChange={handleChange}>
        {Object.keys(AssayType).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}

//-----------------------------------------------------------------------------
function AssaySubForm() {
  const { theAssay } = useAppState();

  if (
    theAssay instanceof SqrGratingAssay ||
    theAssay?.assayType === AssayType.SqrGratingPairs
  ) {
    return <GratingsSubform />;
  }

  if (
    theAssay instanceof ScanningDotsAssay ||
    theAssay?.assayType === AssayType.ScanningDots
  ) {
    return <ScanningDotsSubform />;
  }

  if (
    theAssay instanceof FullFieldSinesAssay ||
    theAssay?.assayType === AssayType.FullFieldSines
  ) {
    return <FullFieldSinesSubform />;
  }

  if (
    theAssay instanceof CheckerboardsAssay ||
    theAssay?.assayType === AssayType.Checkerboards
  ) {
    return <CheckerboardsSubform />;
  }

  if (
    theAssay instanceof LettersAssay ||
    theAssay?.assayType === AssayType.Letters
  ) {
    return <LettersSubform />;
  }

  if (
    theAssay instanceof ImagesAssay ||
    theAssay?.assayType === AssayType.Images
  ) {
    return <ImagesSubform />;
  }

  // eslint-disable-next-line no-debugger
  debugger; // Need to add AssayType code here
  return (
    <div className="text-red-500">SubAssayRanges missing this AssayType.</div>
  );
}
