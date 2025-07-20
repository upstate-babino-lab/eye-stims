import { spawn } from 'child_process';
import {
  ffmpegPath as ffmpegPathStatic,
  ffprobePath as ffprobePathStatic,
} from 'ffmpeg-ffprobe-static';
import {
  stimsCacheDir,
  ensureCacheDirAsync,
  silentBasename,
  ensureSilentFileAsync,
} from './ipc';
import { writeFile as writeFileAsync } from 'fs/promises';
import { unlink as rmAsync } from 'fs/promises';
import { cp as cpAsync, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import * as path from 'path';
import { audioChoices, AudioProps, toneBasename } from './generate-tones';
import { TONE_DURATION_MS, AudioKey, CHOSEN_AUDIO_KEY } from '../constants';
import { assert, getStartTimes } from '../shared-utils';
import { app } from 'electron';
import { parseSrtFileAsync } from './parse-subtitles';

if (!ffmpegPathStatic || !ffprobePathStatic) {
  throw new Error('FFmpeg of FFprobe path not defined');
}
const ffmpegPath = app.isPackaged
  ? ffmpegPathStatic.replace('app.asar', 'app.asar.unpacked')
  : ffmpegPathStatic;
access(ffmpegPath, fsConstants.X_OK)
  .then(() => {
    console.log('>>>>> FFmpeg executable path:', ffmpegPath);
  })
  .catch(() => {
    console.error(
      '>>>>> FFmpeg executable not found or not executable:',
      ffmpegPath
    );
  });

const ffprobePath = app.isPackaged
  ? ffprobePathStatic.replace('app.asar', 'app.asar.unpacked')
  : ffprobePathStatic;
access(ffprobePath, fsConstants.X_OK)
  .then(() => {
    console.log('>>>>> FFprobe executable path:', ffprobePath);
  })
  .catch(() => {
    console.error(
      '>>>>> FFprobe executable not found or not executable:',
      ffprobePath
    );
  });

export async function spawnFfmpegAsync(
  args: string[],
  useFfprobe: boolean = false // Use ffprobePath instead of ffmpegPath
): Promise<string> {
  const startTime = new Date().getTime();
  return new Promise<string>((resolve, reject) => {
    if (useFfprobe) {
      assert(!!ffprobePath, 'ffprobePath undefined');
    } else {
      assert(!!ffmpegPath, 'ffmpegPath undefined');
      args.push('-y'); // Don't wait for user input
    }
    const ffPath = useFfprobe ? ffprobePath : ffmpegPath;
    const ffCommand = useFfprobe ? 'ffprobe' : 'ffmpeg';
    console.log(
      `>>>>> cd '${stimsCacheDir}'\n>>>>> ${ffCommand} ` + args.join(' ')
    );
    const ffProcess = spawn(ffPath, args, { cwd: stimsCacheDir });

    let stdOutput: string = '';
    ffProcess.stdout.on('data', (data) => {
      stdOutput += data.toString();
      // console.log(`>>>>> ${ffCommand} output: `, data.toString());
    });

    let errorOutput: string = '';
    ffProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      /*
      errorOutput += dataStr;
      if (!dataStr.includes('Auto-inserting h264_mp4toannexb bitstream filter')) {
        console.error('ffmpeg stderr:', data.toString());
      }
      errorOutput += dataStr;
      */
      errorOutput = dataStr; // Ignoring all but last stderr for now
    });

    ffProcess.on('close', (code) => {
      // console.error('ffmpeg stderr:', errorOutput);
      const elapsedTime = new Date().getTime() - startTime;
      const elapsedTimeString =
        `${(elapsedTime / 1000).toFixed(2)} seconds =` +
        `${(elapsedTime / 60000).toFixed(2)} minutes`;
      const resultString =
        `${ffCommand} exited after ${elapsedTimeString} ` +
        `with code=${code} stdOutput=${stdOutput} stdOutput.length=${stdOutput.length}`;
      console.log('>>>>> ' + resultString);

      if (code === 0) {
        resolve(
          stdOutput || `${ffCommand} success with elapsedTime=${elapsedTimeString}`
        );
      } else {
        reject(`${ffCommand} exited with error code ${code}: ${errorOutput}`);
      }
    });
  });
}

// TODO: consolidate with render-utils formatSeconds()
/**
 * Converts a given number of milliseconds into an SRT timestamp string.
 * Format: HH:MM:SS,mmm (e.g., 00:00:00,000)
 *
 * @param ms The total number of milliseconds.
 * @returns A string representing the SRT timestamp.
 */
function convertMsToSrtTimestamp(ms: number): string {
  if (ms < 0) {
    // Handle negative milliseconds gracefully, or throw an error if preferred
    console.warn(
      "Input milliseconds cannot be negative. Returning '00:00:00,000'."
    );
    ms = 0;
  }
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms %= 1000 * 60 * 60; // Remaining milliseconds after extracting hours
  const minutes = Math.floor(ms / (1000 * 60));
  ms %= 1000 * 60; // Remaining milliseconds after extracting minutes
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000; // Remaining milliseconds for the decimal part

  // Format with leading zeros
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMilliseconds = String(milliseconds).padStart(3, '0'); // For 3 digits

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds},${formattedMilliseconds}`;
}

// Add text as subtitle to existing mp4 video file
export async function addSubtitleAsync(
  mp4Filename: string,
  durationMs: number,
  text: string
): Promise<string> {
  const subsFilename = mp4Filename.replace('.mp4', '-subs.srt');
  const subtitledFilename = mp4Filename.replace('.mp4', '-with-subs.mp4');
  // Create subtitles file
  const srt: string =
    `1\n` +
    `00:00:00,000 --> ${convertMsToSrtTimestamp(durationMs)}\n` +
    text +
    '\n';
  await writeFileAsync(subsFilename, srt, 'utf-8');

  /* prettier-ignore */
  const args = [
    '-i', mp4Filename,
    '-i', subsFilename,
    '-map', '0',
    '-map', '1',
    '-c', 'copy', // Copy video and audio streams without re-encoding
    '-c:s', 'mov_text', // Use mov_text codec for subtitles
    '-metadata:s:s:0', 'language=eng', // Set subtitle language
    subtitledFilename,
  ];
  await spawnFfmpegAsync(args);
  await cpAsync(subtitledFilename, mp4Filename); // Replace original file with subtitled one
  await Promise.all([rmAsync(subsFilename), rmAsync(subtitledFilename)]); // Remove temporary files
  return mp4Filename;
}

export async function extractSubtitlesAsync(
  mp4Filename: string
): Promise<unknown> {
  const subsFilename = mp4Filename.replace('.mp4', '.srt');
  const newLocal = '-map';
  /* prettier-ignore */
  const mpArgs = [
    '-i', mp4Filename,
    newLocal, '0:s', // Map all subtitle streams
    subsFilename,
  ];
  await spawnFfmpegAsync(mpArgs);
  const subtitles = await parseSrtFileAsync(subsFilename);
  // console.warn(`>>>>> parsed subtitles=${JSON.stringify(subtitles, null, 2)}`);

  /* prettier-ignore */
  const probeArgs = [
    '-v', 'quiet', // Suppress logging output
    '-of', 'json',
    '-show_entries', 'format_tags=title,description,comment',
    mp4Filename,
  ];
  const metaData = await spawnFfmpegAsync(probeArgs, true); // Use ffprobe to get video info
  // console.log(`>>>>> ffprobe metadata: ${metaData}`);
  const metadataJson = JSON.parse(metaData);
  const title = metadataJson?.format?.tags?.title || '';
  const description = metadataJson?.format?.tags?.description || '';
  const comment = metadataJson?.format?.tags?.comment || '';
  try {
    JSON.parse(comment);
  } catch (err) {
    console.warn(
      `>>>>> Failed to parse comment as JSON: ${(err as Error).message}`
    );
  }

  const result = {
    title: title,
    description: description,
    comment: comment,
    stimuli: subtitles.map((e) => e.stim),
  };
  // console.log('>>>>> returning\n' + JSON.stringify(result, null, 2));

  await rmAsync(subsFilename); // Remove temporary subtitles file
  return result;
}

// TODO: Separate out call to assembleAudioFile() so it can be done first and reported to progress bar
export async function buildFromCacheAsync(
  inputFilenames: string[],
  durations: number[],
  outputPath: string,
  title: string = 'EyeStims Video',
  description: string = 'Generated video with audio sync-tones for retinal stimulation',
  audioKey: AudioKey = CHOSEN_AUDIO_KEY // TODO: Choose from GUI
  //reEncodeAudio: boolean,
): Promise<string> {
  const audioProps = audioChoices[audioKey];
  await ensureCacheDirAsync();
  // TODO: uuid filename to allow more than one call to ffmpeg (e.g. for multiple displays)
  const vInputListFilename: string = 'v-input-list.txt';
  const fileList: string =
    inputFilenames.map((name) => `file '${name}'`).join('\n') + '\n';
  await writeFileAsync(
    path.join(stimsCacheDir, vInputListFilename),
    fileList,
    'utf-8'
  );

  const audioFilename = await assembleAudioFile(durations, audioProps);
  /* prettier-ignore */
  const args = [
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', vInputListFilename,
    '-i', audioFilename,
    '-map', '0',
    '-c:v', 'copy', // copy video directly without re-encoding to go faster
    //'-c:v', 'libx264', // Re-encode video
    '-c:s', 'copy', // copy subtitles 
    '-map', '1:a',
    // '-copyts',
    // '-r', displayProps.fps.toString(), // Video framerate should not be necessary
    //'-vsync', 'cfr', // Constant frame rate
    // '-bsf:v', 'h264_mp4toannexb',
    '-metadata', `title=${title}`,
    '-metadata', `description=${description}`,
    '-metadata', `comment=${JSON.stringify({appVersion: app.getVersion()})}`
  ];
  // args.push('-shortest'); // Removes audio completely when using mp3, or not re-encoding with opus
  args.push(outputPath);
  return await spawnFfmpegAsync(args);
}

// FAST way to assemble audio file from segments (but tones can get clipped)
async function assembleAudioFile(
  durationsMs: number[],
  audioProps: AudioProps,
  reEncodeAudio: boolean = true // Slower but prevents tone clipping
): Promise<string> {
  // TODO: uuid name to allow more than one call to ffmpeg (e.g. for multiple displays)
  const inputListFilename: string = 'a-input-list.txt';

  const silentDurations = durationsMs.map((dMs) => dMs - TONE_DURATION_MS);
  silentDurations[0] += TONE_DURATION_MS / 2; // First stim does not start with tone
  await ensureSilentFileAsync(silentDurations[0]); // In case it was not created
  if (silentDurations.length > 1) {
    silentDurations[silentDurations.length - 1] += TONE_DURATION_MS / 2; // Last doesn't end with tone
    await ensureSilentFileAsync(silentDurations[silentDurations.length - 1]); // In case it was not created
  }
  // console.log('>>>>> durationsMS=' + JSON.stringify(durationsMs));
  // console.log('>>>>> silentDurations=' + JSON.stringify(silentDurations));

  // All audio files must use same encoding
  const fileList: string =
    silentDurations
      .map(
        (dMs, index) =>
          `file '${silentBasename(dMs) + audioProps.fileExtension}'\n` +
          (index < silentDurations.length - 1
            ? `file '${toneBasename((index + 1) % 10) + audioProps.fileExtension}'`
            : '') // No tone after last stim
      )
      .join('\n') + '\n';
  await writeFileAsync(
    path.join(stimsCacheDir, inputListFilename),
    fileList,
    'utf-8'
  );

  const AUDIO_FILENAME = 'audio' + audioProps.fileExtension; // Should include uuid??
  /* prettier-ignore */
  const args = [
    '-f', 'concat',
    '-safe', '0', // Allows relative or absolute paths in the input list
    '-i', inputListFilename,
  ].concat(audioProps.ffEncode);
  if (!reEncodeAudio) {
    args.push('-c');
    args.push('copy'); // copy the audio streams directly without re-encoding
    args.push('-copyts');
  }
  args.push(AUDIO_FILENAME);

  await spawnFfmpegAsync(args);
  return AUDIO_FILENAME;
}

// SLOW way to generate audio file from scratch (not using)
// @ts-ignore: TS6133
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateAudioFile(
  durationsMs: number[],
  audioProps: AudioProps
): Promise<string> {
  const filterComplexFilename = 'filter-complex.txt';
  const FILTER_PRE1 = '[mixed]';
  const FILTER_OUTPUT = '[left_stereo]'; //'[boosted]';

  // Create delayed audio instances
  const startTimes = getStartTimes(durationsMs);
  const filterComplex: string[] = startTimes
    .filter((st) => st >= 0.1)
    .map((st, i) => {
      const delay = Math.round(st * 1000) - TONE_DURATION_MS / 2; // Center/peak of tone offset
      return `[0:a] adelay=${delay}|${delay} [a${i}];`;
    });

  // Mix all delayed instances together
  const amixInputs = Array.from(
    { length: filterComplex.length },
    (_, i) => `[a${i}]`
  ).join('');
  filterComplex.push(
    `${amixInputs} amix=inputs=${filterComplex.length} ${FILTER_PRE1};`
  );
  filterComplex.push(
    // Left channel boosted, right channel silenced
    `${FILTER_PRE1}pan=stereo|FL=4.5*c0+0.0*c1|FR=0.0*c0+0.0*c1${FILTER_OUTPUT};`
  );

  // Write filter complex to a text file
  const filterComplexPathname = path.join(stimsCacheDir, filterComplexFilename);
  await writeFileAsync(filterComplexPathname, filterComplex.join('\n'));
  console.log(`>>>>> filterComplex written to ${filterComplexPathname}`);

  const AUDIO_FILENAME = `audio.${audioProps.fileExtension}`; // Should be uuid??
  /* prettier-ignore */
  const args = [
    '-i', 'dtmf-0.wav',
    '-filter_complex_script', filterComplexFilename,
    '-map', FILTER_OUTPUT,
    '-c:a', 'aac', // 'libmp3lame', // 'libopus',
    '-y',
    AUDIO_FILENAME,
  ];
  await spawnFfmpegAsync(args);
  return AUDIO_FILENAME;
}
