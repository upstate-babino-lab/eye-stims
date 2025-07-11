# EyeStims

A desktop application for building `.mp4` videos from `.stims.json` files.

Videos are projected to retinas on a microelectrode array.
Neural signals recorded from the retinas can be precisely aligned to each corresponding visual stimulus.

## Minimal Example

This four-stim video was built from the file `example.stims.json` below

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
      "width": 10,
      "speed": 10,
      "angle": 45
    },
    {
      "stimType": "SqrGrating",
      "bgColor": "black",
      "durationMs": 2000,
      "angle": 45,
      "fgColor": "white",
      "speed": 10,
      "width": 10
    },
    {
      "stimType": "SinGrating",
      "bgColor": "black",
      "durationMs": 2000,
      "angle": -45,
      "fgColor": "white",
      "speed": 50,
      "width": 10
    }
  ]
}
```

Boundaries between each stimulus are marked by DTMF [sync-tones](sync-tones.md) on the left audio channel. This audio signal is recorded as an analog input along with the MEA data to precisely mark each stimulus timestamp within the recorded MEA data.

## Getting started

1. From [releases](https://github.com/upstate-babino-lab/eye-stims/releases/latest), download and install the appropriate installation file for your platform (`.dmg` for Mac, `.exe` for Windows, or `.deb` for Linux)

2. Create a `.stims.json` file. You can do this in several ways:
   - By hand in a text editor (e.g. by copying the example above)
   - Run a command-line TypeScript program [like one of these](./stimlist-creators/)
   - Run a command-line Python program using [py-stims](https://github.com/upstate-babino-lab/py-stims)

3. Run EyeStims and load your `.stims.json` file. You can preview each stimulus and experiment with its parameters to ensure it does what you want.

4. Press the **Build** button to create the `.mp4` video file.

5. Play your video using any .mp4 player to project the stimuli onto a retina, while also recording the left audio channel for sync-tones.

## Development

Tools: [Electron](https://www.electronjs.org/) + [Vite](https://vite.dev/) + [React](https://react.dev/) + [Tailwind](https://tailwindcss.com/)  
IDE: [VS Code](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

```bash
$ npm install
$ npm run dev
```
