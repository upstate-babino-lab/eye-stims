import { ImagesAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import { INPUT_STYLES } from '../components/RangeSpecForm';
import Button from '../components/Button';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '../render-utils';

export function ImagesSubform() {
  const { theAssay, setTheAssay } = useAppState();
  const { size, directory } = theAssay as ImagesAssay;

  if (!theAssay || !(theAssay instanceof ImagesAssay)) {
    return <div className="text-red-500">No valid ImagesAssay available</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 flex items-center w-full bg-gray-800 rounded-lg px-2 py-1">
        <label className="text-sm font-bold text-gray-100 px-4">Directory:</label>
        <div>{directory}</div>
      </div>

      <Button
        className="mx-auto mb-1"
        onClick={async () => {
          const paths = await window.electron.scanImagesInDirectoryAsync();
          if (paths.length > 0) {
            const newImagesAssay = new ImagesAssay({
              ...theAssay,
              directory: paths[0], // First element is the directory
            });
            newImagesAssay.imagePaths = paths.slice(1); // Remaining elements are the images
            setTheAssay(newImagesAssay);
          }
        }}
      >
        Select directory of images
      </Button>

      <div>
        <div
          className="flex items-center bg-gray-800 rounded-lg px-2 py-1 mb-1 w-45"
          data-tooltip-id={'image-size-id'}
          data-tooltip-content="Size of images as a percent of viewport size"
          data-tooltip-place="right"
        >
          <label className="text-sm font-bold text-gray-100 px-4">Size %:</label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theAssay?.size ? theAssay?.size : size}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheAssay(
                new ImagesAssay({
                  ...theAssay,
                  size: newValue,
                })
              );
            }}
            min={10}
            max={100}
            step={10}
          />
        </div>
      </div>
      <Tooltip id={'image-size-id'} className={TOOLTIP_STYLES} />
    </div>
  );
}
