import { app, shell, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import * as yaml from 'js-yaml';
import * as fsp from 'fs/promises'; // Use fs/promises for async file operations
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

let theMainWindow: BrowserWindow;

function modifyDefaultMenu(mainWindow: BrowserWindow) {
  const defaultMenu = Menu.getApplicationMenu();
  if (!defaultMenu) {
    return;
  }
  const newMenu = new Menu();
  defaultMenu.items
    .filter((item) => item.role != 'help')
    .forEach((defaultMenuItem) => {
      console.log(`>>>>> menuItem.role=${defaultMenuItem.role}`);
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

function createWindow(): void {
  // Create the browser window.
  theMainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      //sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  modifyDefaultMenu(theMainWindow);

  theMainWindow.on('ready-to-show', () => {
    theMainWindow.show();
  });

  theMainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    theMainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    theMainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Called from App menu or IPC request from renderer
async function loadFileDialogAsync(mainWindow: BrowserWindow) {
  const jsonlEndings = ['jsonl', 'JSONL'];
  const yamlEndings = ['yaml', 'yml', 'json', 'stims'];
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'], // Only one single file
    filters: [
      {
        name: 'StimSequence',
        extensions: [...jsonlEndings, ...yamlEndings],
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
  console.log(`>>>>> main sending 'file-loaded' with parsedContent`);
  mainWindow.webContents.send('file-loaded', filePath, parsedContent);
}

//-----------------------------------------------------------------------------
// IPC handlers

ipcMain.on('load-file', () => {
  console.log(`>>>>> main got 'load-file'`);
  loadFileDialogAsync(theMainWindow).catch((err) => {
    console.log('ERROR from loadFileDialogAsync(): ' + err);
  });
});

ipcMain.on('save-file', (_, { filePath, content }) => {
  console.log(`>>>>> main got 'save-file'`);
  fs.writeFile(filePath, content, 'utf-8', (err) => {
    if (err) console.error('Error saving file:', err);
  });
});

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
