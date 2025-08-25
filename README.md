# EyeStims

A desktop application for building `.mp4` video files to stimulate retinas.

Videos are projected to retinas on a microelectrode array, and neural signals recorded from the retinas can be precisely aligned to each corresponding visual stimulus for subsequent analysis of neural spike trains.

EyeStims can build videos in two ways: 1) from higher-level Assays, or 2) from lower-level Stim sequence.

### Assays

A set of pre-defined Assays can be configured from the GUI, including the following:

- Pairs of gratings moving left and right for a range of sizes, contrasts, and speeds.
- Flashing dots for a range of diameters and locations.
- Full-field sinusoidal variation of intensity for a range of intensities, contrasts, and frequencies.
- Checkerboards of varying contrasts and sizes.
- Sloan letters of varying sizes and contrasts.
- Images

### Stims

Finer control of detailed stimuli and their parameters can be achieved with EyeStims by loading a sequence of stimuli from a `.stims.json` file created by hand or from a program.

Parameterized Stims currently available are listed below.

- Solid
- Bar
- Checkerboard
- Dot
- FFSine
- SqrGrating
- SinGrating
- ImageStim
- Letter

It's fairly easy to create additional stimuli. Please open an issue if you would like to request something new!

## Minimal Example

This video was built from the file `example.stims.json` below

![Example video](example.stims.gif)

```json
{
  "title": "Minimal Example",
  "description": "From README",
  "stimuli": [
    {
      "stimType": "Solid",
      "bgColor": "green",
      "durationMs": 2000
    },
    {
      "stimType": "Bar",
      "bgColor": "black",
      "durationMs": 2000,
      "fgColor": "orange",
      "cpd": 10,
      "speed": 10,
      "angle": 45
    },
    {
      "stimType": "SqrGrating",
      "bgColor": "black",
      "durationMs": 2000,
      "angle": 45,
      "fgColor": "white",
      "speed": 4,
      "cpd": 0.3
    },
    {
      "stimType": "SinGrating",
      "bgColor": "black",
      "durationMs": 2000,
      "angle": -45,
      "fgColor": "white",
      "speed": 5,
      "cpd": 0.1
    },
    {
      "stimType": "Checkerboard",
      "bgColor": "black",
      "durationMs": 2000,
      "invertMs": 1000,
      "fgColor": "white",
      "cpd": 0.1
    }
  ]
}
```

Boundaries between each stimulus are marked by DTMF [sync-tones](sync-tones.md) on the left audio channel. This audio signal is recorded as an analog input along with the MEA data to precisely mark each stimulus timestamp within the recorded MEA data.

## Getting started

1. From [releases](https://github.com/upstate-babino-lab/eye-stims/releases/latest), download and install the appropriate installation file for your platform (`.dmg` for Mac, `.exe` for Windows, or `.deb` for Linux)

2. Run EyeStims, press the "New Assay" button, and use the GUI to specify
   the type of Assay you want and its range of parameters.

3. Press the **Build** button to create the `.mp4` video file.

4. Play your video using any .mp4 player to project the stimuli onto a retina, while also recording the left audio channel for sync-tones.

5. (optional) Create a `.stims.json` file. You can do this in several ways:
   - By hand in a text editor (e.g. by copying the example above)
   - Run a command-line TypeScript program [like one of these](./stimlist-creators/)
   - Run a command-line Python program using [py-stims](https://github.com/upstate-babino-lab/py-stims)

6. Load your `.stims.json` You can preview each stimulus and experiment with its parameters to ensure it does what you want before building and playing your video.

## Development

Tools: [Electron](https://www.electronjs.org/) + [Vite](https://vite.dev/) + [React](https://react.dev/) + [Tailwind](https://tailwindcss.com/)  
IDE: [VS Code](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

```bash
$ npm install
$ npm run dev
```
