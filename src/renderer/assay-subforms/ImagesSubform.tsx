import { ImagesAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import { INPUT_STYLES } from '../components/RangeSpecForm';

export function ImagesSubform() {
  const { theAssay, setTheAssay } = useAppState();
  const { size, directory } = theAssay as ImagesAssay;

  if (!theAssay || !(theAssay instanceof ImagesAssay)) {
    return <div className="text-red-500">No valid ImagesAssay available</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-3 flex items-center w-full">
        <label className="text-sm font-bold text-gray-100 px-4">
          Directory of images:
        </label>
        <div>{directory}</div>
      </div>

      <div className="mb-1 flex items-center">
        <label className="text-sm font-bold text-gray-100 px-4">Size:</label>
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
  );
}
