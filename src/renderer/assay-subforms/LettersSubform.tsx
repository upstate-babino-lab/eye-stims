import { RangeSpec, LettersAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';

export function LettersSubform() {
  const { theAssay, setTheAssay } = useAppState();
  const { sizes, contrasts } = theAssay as LettersAssay;

  if (!theAssay || !(theAssay instanceof LettersAssay)) {
    return <div className="text-red-500">No valid LettersAssay available</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <RangeSpecForm
        title="Sizes (in degrees)"
        toolTip="Height of letter in degrees of visual angle"
        onUpdate={(sizes: RangeSpec) => {
          setTheAssay(
            new LettersAssay({
              ...theAssay,
              sizes: sizes,
            })
          );
        }}
        initialRange={sizes}
      />
      <RangeSpecForm
        title="Contrasts"
        toolTip={`Michelson contrast (max-min)/(max+min) range 0% to 100%`}
        onUpdate={(contrasts: RangeSpec) => {
          // console.log('>>>>> contrasts=' + JSON.stringify(contrasts));
          setTheAssay(
            new LettersAssay({
              ...theAssay,
              contrasts: contrasts,
            })
          );
        }}
        initialRange={contrasts}
        min={0}
        max={100}
      />
    </div>
  );
}
