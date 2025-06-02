import { FixedSizeList as List, ListChildComponentProps } from 'react-window'; // Only render visible items in list
import AutoSizer from 'react-virtualized-auto-sizer'; // Resizes list when container size changes
import { Stimulus } from '@stims/index';
import { useAppState } from './StateContext';
import {
  formatSeconds,
  roundNumericalProperties,
  stableStringify,
} from './render-utils';

const ROW_HEIGHT = 30;
const CELL_FORMAT = 'min-w-19 p-0.5 text-left';
const TYPE_FORMAT = CELL_FORMAT + ' min-w-25'; // Typename column a bit wider

const StimList = ({
  data,
  onRowClick,
}: {
  data: Stimulus[];
  onRowClick: (id: number) => void;
}) => {
  return (
    <>
      <div
        className={`sticky top-0 z-10 flex flex-row bg-gray-700 rounded-t`}
        style={{ height: ROW_HEIGHT }}
      >
        <div className={CELL_FORMAT}>Index</div>
        <div className="min-w-30 p-0.5 text-left">h:m:s.cs</div>
        <div className={TYPE_FORMAT}>Type</div>
        <div className="group relative">
          <div className={CELL_FORMAT + ' min-w-22'}>Duration</div>
          <div className=" bg-gray-700 px-2 rounded-md invisible group-hover:visible font-normal">
            seconds
          </div>
        </div>
        <div className={CELL_FORMAT + ' min-w-22'}>bgColor</div>
      </div>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height - ROW_HEIGHT}
            itemCount={data.length}
            itemSize={ROW_HEIGHT - 2}
            width={width}
            itemData={{ data, onRowClick }}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </>
  );
};

// eslint-disable-next-line prettier/prettier
function Row({ index, style, data, }: ListChildComponentProps<{
  data: Stimulus[];
  onRowClick: (id: number) => void;
}>) {
  const { theStimSequence } = useAppState();
  const row = data.data[index];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stimType: name, durationMs, bgColor, meta, ...partial } = row;
  if (partial.headMs == 0) {
    delete partial.headMs;
  }
  if (partial.tailMs == 0) {
    delete partial.tailMs;
  }
  if (!partial.headMs && !partial.tailMs) {
    delete partial.bodyMs;
  }
  // Excludes private props and ensure more compact number formatting
  const partialJson = stableStringify(roundNumericalProperties(partial));

  return (
    <div
      style={style}
      className="flex flex-row border border-gray-800 hover:border-gray-400 hover:bg-gray-800 transition cursor-pointer"
      onClick={() => data.onRowClick(index)}
    >
      <div className={CELL_FORMAT}>{index}</div>
      <div className="min-w-30 p-0.5 text-left">
        {formatSeconds(
          theStimSequence ? theStimSequence.startTimes[index] / 1000 : 0
        )}
      </div>
      <div className={TYPE_FORMAT}>{row.stimType}</div>
      <div className={CELL_FORMAT + ' min-w-22'}>
        {(row.durationMs / 1000).toFixed(2)}
      </div>
      <div className={CELL_FORMAT + ' min-w-22'}>{row.bgColor}</div>
      {partialJson !== '{}' && (
        <div className="grow p-0.5 text-left">{partialJson}</div>
      )}
    </div>
  );
}

export default StimList;
