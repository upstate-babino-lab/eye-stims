
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'; // Only render visible items in list
import AutoSizer from 'react-virtualized-auto-sizer'; // Resizes list when container size changes
import { Stimulus } from './stimulus';

const StimList = ({
  data,
  onRowClick,
}: {
  data: Stimulus[];
  onRowClick: (id: number) => void;
}) => {
  const ROW_HEIGHT = 28;
  return (
    <>
      <div
        className={`sticky top-0 z-10 flex flex-row bg-gray-700 border-b rounded-t border-gray-300 font-bold`}
        style={{ height: ROW_HEIGHT }}
      >
        <div className="w-15 text-left">Index</div>
        <div className="w-20 text-left">Type</div>
        <div className="group relative">
          <div className="w-20">duration</div>
          <div className=" bg-gray-700 px-2 rounded-md invisible group-hover:visible font-normal">
            seconds
          </div>

        </div>
        <div className="w-20">bgColor</div>
      </div>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height - ROW_HEIGHT}
            itemCount={data.length}
            itemSize={ROW_HEIGHT}
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
  const row = data.data[index];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name, duration, bgColor, ...partial } = row;
  const partialJson = JSON.stringify(partial);
  return (
    <div
      style={style}
      className="flex flex-row border border-gray-800 hover:border-gray-400 hover:bg-gray-800 transition cursor-pointer"
      onClick={() => data.onRowClick(index)}
    >
      <div className="min-w-15 text-left font-bold">{index}:</div>
      <div className="min-w-20 text-left">{row.name}</div>
      <div className="min-w-20">{row.duration.toFixed(2)}</div>
      <div className="min-w-20">{row.bgColor}</div>
      {partialJson !== '{}' && <div className="grow text-left">{partialJson}</div>}
    </div>
  );
};

export default StimList;
