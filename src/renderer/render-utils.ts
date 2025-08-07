export const TOOLTIP_STYLES =
  '!bg-gray-700 !text-gray-300 !text-xs !rounded-sm !my-1';

export function capitalize(str: string) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds: number = seconds % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds =
    remainingSeconds % 1
      ? remainingSeconds.toFixed(2).padStart(5, '0') // partial second
      : String(remainingSeconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Allows deep comparison of JSON (not counting _private properties)
export function stableStringify(obj: unknown, skipPrivate = true): string {
  if (Array.isArray(obj)) {
    // For arrays, JSON.stringify converts undefined to null.
    // To match this, we'll keep the recursive call.
    // If you wanted to *remove* undefined from arrays too,
    // you'd add a filter here: obj.filter(item => item !== undefined).
    return `[${obj.map((item) => stableStringify(item, skipPrivate)).join(',')}]`;
  } else if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj)
      .filter((key) => {
        // Exclude private keys if skipPrivate is true
        if (skipPrivate && key.startsWith('_')) {
          return false;
        }
        // Eliminate properties whose value is undefined
        return obj[key] !== undefined;
      })
      .sort(); // Sort keys for stable output

    const entries = keys.map(
      (key) => `${JSON.stringify(key)}:${stableStringify(obj[key], skipPrivate)}`
    );

    return `{${entries.join(',')}}`;
  } else {
    // For primitive values:
    // JSON.stringify(undefined) returns undefined (the JS primitive),
    // which is not valid JSON if it's the root value.
    // If the top-level `obj` is undefined, we return "null" as a valid JSON representation.
    // If it's a property's value, it would have been filtered out above.
    if (obj === undefined) {
      return 'null'; // Or throw an error, depending on desired behavior for root undefined
    }
    return JSON.stringify(obj);
  }
}

export async function saveFileDialogAsync(
  suggestedFilename: string
): Promise<string> {
  let extension = '';
  let name = '';
  if (suggestedFilename.endsWith('.mp4')) {
    name = 'Stim videos';
    extension = 'mp4';
  }
  if (suggestedFilename.endsWith('.stims.json')) {
    name = 'Stim sequences';
    extension = '.stims.json';
  }
  if (suggestedFilename.endsWith('.assay.json')) {
    name = 'Stim specs';
    extension = '.assays.json';
  }
  const result = await window.electron.showSaveDialogAsync({
    title: 'Save File',
    defaultPath: suggestedFilename,
    filters: [{ name: name, extensions: [extension] }],
  });
  if (result.canceled || !result.filePath) {
    return '';
  }
  return result.filePath;
}

export function roundNumericalProperties(obj) {
  const newObj = { ...obj }; // Create a shallow copy to avoid mutating the original object

  Object.keys(newObj).forEach((key) => {
    // Check if the value is a number
    if (typeof newObj[key] === 'number') {
      newObj[key] = Math.round(newObj[key] * 10000) / 10000; // For more compact formatting
    }
  });
  return newObj;
}

/*
// Compare elements JSON stableStringify (not counting _private properties)
// and ensure duplicates point to the same object
export function deepDeduplicate<T>(arr: T[]): T[] {
  const map = new Map<string, T>();
  const result: T[] = [];

  for (const obj of arr) {
    const json = stableStringify(obj);
    if (!map.has(json)) {
      map.set(json, obj);
    }
    const dedupedObj = map.get(json);
    if (!dedupedObj) {
      throw new Error('dedupedObj should not be null');
    }
    if (dedupedObj) {
      result.push(dedupedObj);
    }
  }
  return result;
}
*/
