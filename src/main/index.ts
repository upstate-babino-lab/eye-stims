import { app, shell, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
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
                click: async () => {
                  console.log(`>>>>> App menu 'Load File' clicked`);
                  loadFileDialogAsync(mainWindow);
                },
              },
              {
                label: 'Save File',
                click: async () => {
                  console.log(`>>>>> App menu 'Save File' clicked`);
                  const { filePath } = await dialog.showSaveDialog({});
                  if (filePath && mainWindow) {
                    mainWindow.webContents.send('request-save-file', filePath);
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
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
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

async function loadFileDialogAsync(mainWindow) {
  const endings = ['jsonl', 'stim', 'JSONL', 'STIM'];
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'], // Only one single file
    filters: [
      { name: 'Newline-terminated JSON files', extensions: endings },
      { name: 'MP4 video files', extensions: ['mp4'] },
    ],
  });
  if (filePaths.length > 0) {
    if (filePaths.length !== 1) {
      throw new Error('Expecting to load one single file');
    }
    const filePath = filePaths[0];
    if (endings.some((ending) => filePath.endsWith('.' + ending))) {
      const parsedObjects = await readJsonlFile(filePath);
      mainWindow.webContents.send('file-loaded', parsedObjects);
    }
  }
}

//-----------------------------------------------------------------------------
// IPC handlers

ipcMain.on('load-file', () => {
  console.log(`>>>>> main got 'load-file'`);
  loadFileDialogAsync(theMainWindow);
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
