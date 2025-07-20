import { BrowserWindow, Menu, dialog } from 'electron';
import * as readline from 'readline';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as fsp from 'fs/promises'; // Use fs/promises for async file operations
import { clearStimCacheAsync } from './ipc';
import { extractSubtitlesAsync } from './spawn-ffmpeg';
import { app } from 'electron';

export function modifyDefaultMenu(mainWindow: BrowserWindow) {
  const defaultMenu = Menu.getApplicationMenu();
  if (!defaultMenu) {
    return;
  }
  const newMenu = new Menu();
  defaultMenu.items
    .filter((item) => item.role != 'help')
    .forEach((defaultMenuItem) => {
      // console.log(`>>>>> menuItem.role=${defaultMenuItem.role}`);
      if (
        defaultMenuItem.role &&
        defaultMenuItem.role.toLowerCase() == 'filemenu'
      ) {
        const newFileMenu = Menu.buildFromTemplate([
          {
            label: 'File',
            submenu: [
              {
                label: 'Load File',
                click: () => {
                  console.log(`>>>>> App menu 'Load File' clicked`);
                  loadFileDialogAsync(mainWindow).catch((err) => {
                    console.log('ERROR from loadFileDialogAsync(): ' + err);
                  });
                },
              },
              /*
              {
                label: 'Save File',
                click: async () => {
                  console.log(`>>>>> App menu 'Save File' clicked`);
                  const { filePath } = await dialog.showSaveDialog({});
                  if (filePath && mainWindow) {
                    mainWindow.webContents.send('request-file-to-save', filePath);
                  }
                },
              },
              */
              {
                label: 'Clear Stim Cache',
                click: clearStimCacheAsync,
              },
              {
                label: `Version ${app.getVersion()}`,
              },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]);
        newMenu.append(newFileMenu.items[0]);
      } else {
        // Keep default
        newMenu.append(defaultMenuItem);
      }
    });
  Menu.setApplicationMenu(newMenu);
}

// Called from App menu or IPC request from renderer
export async function loadFileDialogAsync(mainWindow: BrowserWindow) {
  const jsonlEndings = ['jsonl', 'JSONL'];
  const yamlEndings = ['yaml', 'yml', 'json', 'stims'];
  const mp4Endings = ['mp4', 'MP4'];
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'], // Only one single file
    filters: [
      {
        name: 'StimSequence',
        extensions: [...jsonlEndings, ...yamlEndings, ...mp4Endings],
      },
      { name: 'MP4 video files', extensions: ['mp4'] },
    ],
  });
  if (filePaths.length !== 1) {
    throw new Error('Expecting to load one single file');
  }
  const filePath = filePaths[0];
  let parsedContent: unknown = null;

  if (jsonlEndings.some((ending) => filePath.endsWith('.' + ending))) {
    parsedContent = await readJsonlFile(filePath);
  }
  if (yamlEndings.some((ending) => filePath.endsWith('.' + ending))) {
    parsedContent = await readYamlFile(filePath);
  }
  if (mp4Endings.some((ending) => filePath.endsWith('.' + ending))) {
    parsedContent = await extractSubtitlesAsync(filePath);
  }
  console.log(`>>>>> main sending 'file-loaded' with parsedContent`);
  mainWindow.webContents.send('file-loaded', filePath, parsedContent);
}

//-----------------------------------------------------------------------------
// Read and parse newline-terminated JSON file streaming it line-by-line
async function readJsonlFile(filePath: string): Promise<unknown[]> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const parsedObjects: Array<unknown> = [];
  for await (const line of rl) {
    try {
      const jsonO = JSON.parse(line);
      parsedObjects.push(jsonO);
    } catch (err) {
      console.error(`Error parsing JSON: ${(err as Error).message}`);
    }
  }
  return parsedObjects;
}

//-----------------------------------------------------------------------------
// TODO: change return type
async function readYamlFile(filePath: string): Promise<unknown | null> {
  try {
    const fileContents = await fsp.readFile(filePath, 'utf8');
    const parsedData = yaml.load(fileContents) as unknown;
    return parsedData;
  } catch (error) {
    console.error(`Error parsing YAML file: ${error}`);
    return null; // or throw error, depending on your error handling strategy
  }
}
