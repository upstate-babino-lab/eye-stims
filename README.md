# EyeStims

An Electron application to build `.mp4` videos from `.stims` JSON or YAML files.

Videos are projected to retinas on a microelectrode array, and neural signal data from the retinas can be precisely aligned with each corresponding visual stimulus for analysis using audio sync-tones.

## Example

The following `example.stims` file

```json
[
  { "durationMs": 1000, "name": "Solid", "bgColor": "white" },
  { "durationMs": 1000, "name": "Solid", "bgColor": "green" }
]
```

builds the following `example.mp4` video:

Boundaries between each stimulus are marked by DTMF sync-tones recorded from the analog-in data collection channel to precisely mark each stimulus timestamp.

## Getting started

1. From [releases](https://github.com/upstate-babino-lab/eye-stims/releases), download and install the appropriate installation file for your platform (`.dmg` for Mac, `.exe` for Windows, or `.deb` for Linux)

2. Create a `.stims` file. You can do this by hand, from a TypeScript program like [these](https://github.com/upstate-babino-lab/eye-stims/tree/main/tools), or from a Python program using [py-stims]()

3. Run EyeStims and load your `.stims` file. You can preview each stimulus and experiment with its parameters to ensure it does what you want.

4. Press the **Build** button to create the `.mp4` video file.

5. Play your video using any .mp4 player to project the stimuli on a retina, while also recording the left audio channel for sync-tones.

## Development

IDE: [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

```bash
$ npm install
$ npm run dev
```
