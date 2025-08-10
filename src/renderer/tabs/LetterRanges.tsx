import { RangeSpec, LettersAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import RangeSpecForm from '../components/RangeSpecForm';

export function LetterRanges() {
  const { theAssay: theStimsSpec, setTheAssay: setTheStimsSpec } = useAppState();
  const { sizes, contrasts } = theStimsSpec as LettersAssay;

  if (!theStimsSpec || !(theStimsSpec instanceof LettersAssay)) {
    return <div className="text-red-500">No valid LettersAssay available</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <RangeSpecForm
        title="Sizes (in degrees)"
        toolTip="Width of letter in degrees of visual angle"
        onUpdate={(sizes: RangeSpec) => {
          setTheStimsSpec(
            new LettersAssay({
              ...theStimsSpec,
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
          setTheStimsSpec(
            new LettersAssay({
              ...theStimsSpec,
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
