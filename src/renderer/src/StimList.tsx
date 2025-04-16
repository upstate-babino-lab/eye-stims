import { FixedSizeList as List, ListChildComponentProps } from 'react-window'; // Only render visible items in list
import AutoSizer from 'react-virtualized-auto-sizer'; // Resizes list when container size changes
import { Stimulus } from './stims/Stimulus';
import { useTheStimSequence } from './StateContext';
import { formatSeconds } from './utilities';

const ROW_HEIGHT = 30;
const CELL_FORMAT = 'min-w-20 p-0.5 text-left';

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
        <div className="min-w-30 p-0.5 text-left">h:m:s</div>
        <div className={CELL_FORMAT}>Type</div>
        <div className="group relative">
          <div className={CELL_FORMAT}>duration</div>
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
  const { name, duration, bgColor, meta, _cachedFilename, ...partial } = row;
  const partialJson = JSON.stringify(partial);

  return (
    <div
      style={style}
      className="flex flex-row border border-gray-800 hover:border-gray-400 hover:bg-gray-800 transition cursor-pointer"
      onClick={() => data.onRowClick(index)}
    >
      <div className={CELL_FORMAT}>{index}</div>
      <div className="min-w-30 p-0.5 text-left">
        {formatSeconds(theStimSequence ? theStimSequence.startTimes[index] : 0)}
      </div>
      <div className={CELL_FORMAT}>{row.name}</div>
      <div className={CELL_FORMAT}>{row.duration.toFixed(2)}</div>
      <div className={CELL_FORMAT}>{row.bgColor}</div>
      {partialJson !== '{}' && (
        <div className="grow p-0.5 text-left">{partialJson}</div>
      )}
    </div>
  );
}

export default StimList;
