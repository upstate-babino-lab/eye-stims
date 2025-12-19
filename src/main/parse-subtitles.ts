import * as fs from 'fs'; // For Node.js environment
import * as path from 'path'; // Optional, for path resolution

/**
 * Interface for a single subtitle cue object.
 */
export interface SubtitleCue {
  sequence: number;
  startTime: number; // Duration in seconds
  endTime: number; // Duration in seconds
  durationMs: number; // Duration of the cue in milliseconds (endTime - startTime)
  text?: string;
  stim: unknown;
}

/**
 * Converts a time string (HH:MM:SS,ms) from SRT to seconds.
 * Example: "00:01:05,500" => 65.5
 * @param timeStr The time string from the SRT file.
 * @returns The time in seconds.
 */
function parseSrtTime(timeStr: string): number {
  const [hours, minutes, secondsAndMs] = timeStr.split(':');
  const [seconds, milliseconds] = secondsAndMs.split(',');

  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(milliseconds) / 1000
  );
}

/**
 * Parses an SRT file content into an array of SubtitleCue objects.
 * @param srtContent The content of the SRT file as a string.
 * @returns An array of SubtitleCue objects.
 */
export function parseSrtContent(srtContent: string): SubtitleCue[] {
  const subtitles: SubtitleCue[] = [];

  // Split the content into blocks based on double newlines
  const blocks = srtContent.trim().split(/\r?\n\s*\r?\n/);

  const srtBlockRegex =
    /(\d+)\r?\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\r?\n(.+$)/;

  for (const block of blocks) {
    // Some SRT files might have empty blocks due to extra newlines, skip them
    if (!block.trim()) {
      continue;
    }

    const match = block.match(srtBlockRegex);

    if (match) {
      const sequence = parseInt(match[1]);
      const startTimeStr = match[2];
      const endTimeStr = match[3];
      const textBlock = match[4].trim(); // Trim to remove any trailing newlines

      const startTime = parseSrtTime(startTimeStr);
      const endTime = parseSrtTime(endTimeStr);
      const duration = Math.round((endTime - startTime) * 1000); // Nearest millisecond
      //const text = textBlock.split(/\r?\n/); // Split text block by newline for multi-line subtitles
      let stim: unknown = undefined;
      try {
        stim = JSON.parse(textBlock); // Validate that textBlock is a valid JSON string
      } catch {
        console.warn(`>>>>> Skipping malformed JSON in SRT block: \n${block}`);
      }
      subtitles.push({
        sequence,
        startTime,
        endTime,
        durationMs: duration,
        text: textBlock ? textBlock : undefined,
        stim: stim,
      });
    } else {
      console.warn(`>>>>> Skipping malformed SRT block: \n${block}`);
    }
  }

  return subtitles;
}

/**
 * Reads an SRT file from the given path and parses its content.
 * This function is for Node.js environments.
 * @param filePath The path to the SRT file.
 * @returns A Promise that resolves to an array of SubtitleCue objects.
 */
export async function parseSrtFileAsync(filePath: string): Promise<SubtitleCue[]> {
  try {
    const fullPath = path.resolve(filePath); // Resolve to an absolute path
    const srtContent = await fs.promises.readFile(fullPath, { encoding: 'utf-8' });
    return parseSrtContent(srtContent);
  } catch (error) {
    console.error(`Error reading or parsing SRT file "${filePath}":`, error);
    throw error;
  }
}
