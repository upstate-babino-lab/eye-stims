import { app, protocol, shell, BrowserWindow, net } from 'electron';
import * as path from 'path';
import fs from 'fs';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { modifyDefaultMenu } from './menu';
import { setupIpcHandlers } from './ipc';

export let theMainWindow: BrowserWindow;

const PROTOCOL_NAME = 'image';
protocol.registerSchemesAsPrivileged([
  {
    scheme: PROTOCOL_NAME,
    privileges: {
      standard: false, // False to allow absolute paths like 'image:///Users/...'
      bypassCSP: true,
      corsEnabled: true,
      supportFetchAPI: true,
    },
  },
]);

function createTheMainWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      //sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  modifyDefaultMenu(mainWindow);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  theMainWindow = mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  protocol.handle(PROTOCOL_NAME, async (request) => {
    // The request.url will be something like `${PROTOCOL_NAME}://path/to/image.jpg`
    try {
      const parsedUrl = new URL(request.url);
      const filePath = parsedUrl.pathname;

      // If the URL comes from Windows, the path might be like /C:/path/...
      // The pathToFileURL function handles this correctly.
      // We also need to decode any URI-encoded characters.
      const decodedPath = decodeURIComponent(filePath);
      const finalPath =
        process.platform === 'win32' && decodedPath.startsWith('/')
          ? decodedPath.slice(1) // Remove leading slash on Windows
          : decodedPath;

      fs.stat(finalPath, (err, stats) => {
        if (err || !stats.isFile()) {
          console.error(`File does NOT exist: ${finalPath}`);
        }
      });

      const fileUrl = `file://${finalPath}`;
      return net.fetch(fileUrl);
    } catch (error) {
      console.error(
        `Failed ${PROTOCOL_NAME} protocol request request.url=${request.url} error=`,
        error
      );
      return new Response(null, { status: 400, statusText: 'Bad Request' });
    }
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createTheMainWindow();
  setupIpcHandlers();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createTheMainWindow();
    }
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
