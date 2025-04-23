import { FixedSizeList as List, ListChildComponentProps } from 'react-window'; // Only render visible items in list
import AutoSizer from 'react-virtualized-auto-sizer'; // Resizes list when container size changes
import { Stimulus } from './stims/Stimulus';
import { useTheStimSequence } from './StateContext';
import { formatSeconds, stableStringify } from './render-utils';

const ROW_HEIGHT = 30;
const CELL_FORMAT = 'min-w-16 p-0.5 text-left';
const TYPE_FORMAT = CELL_FORMAT + ' min-w-25'; // Typename column a bit wider
const DURATION_FORMAT = CELL_FORMAT + ' min-w-27'; // Typename column a bit wider

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
        className={`sticky top-0 z-10 flex flex-row bg-gray-700 rounded-t `}
        style={{ height: ROW_HEIGHT }}
      >
        <div className={CELL_FORMAT}>Index</div>
        <div className="min-w-30 p-0.5 text-left">h:m:s.ms</div>
        <div className={TYPE_FORMAT}>Type</div>
        <div className="group relative">
          <div className={DURATION_FORMAT}>Duration</div>
          <div className=" bg-gray-700 px-2 rounded-md invisible group-hover:visible font-normal">
            seconds
          </div>
        </div>
        <div className={CELL_FORMAT}>bgColor</div>
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
  const { theStimSequence } = useTheStimSequence();
  const row = data.data[index];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name, durationMs, bgColor, meta, ...partial } = row;
  const partialJson = stableStringify(partial); // Excludes private props

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
      <div className={TYPE_FORMAT}>{row.name}</div>
      <div className={DURATION_FORMAT}>{(row.durationMs / 1000).toFixed(3)}</div>
      <div className={CELL_FORMAT}>{row.bgColor}</div>
      {partialJson !== '{}' && (
        <div className="grow p-0.5 text-left">{partialJson}</div>
      )}
    </div>
  );
}

export default StimList;
