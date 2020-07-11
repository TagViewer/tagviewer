/*
  Tag Viewer: A simple program that allows viewing of images under any tag, as well as modifying those tags. Sorting is also implemented.
  Copyright (C) 2020  Matt Fellenz

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

  Email: mattf53190@gmail.com
*/

const electron = require('electron');
const path = require('path');
if (require('electron-squirrel-startup')) return;
// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      return true;
  }
};
electron.app.showExitPrompt = false;
let win;
const createWindow = () => {
  win = new electron.BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 830,
    minHeight: 550,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    title: 'TagViewer',
    icon: path.join(__dirname, 'icons', 'png', '64x64.png'),
    backgroundColor: '#fff'
  });
  // const appIcon = new electron.Tray('icon.png'); // what is this for?
  win.loadFile('index.html');
  win.on('close', e => {
    if (electron.app.showExitPrompt) {
      e.preventDefault(); // Prevents the window from closing
      const action = electron.dialog.showMessageBoxSync(win, {
        type: 'question',
        buttons: ['Cancel', "Don't Save", 'Save'],
        title: 'Metadata not Synced.',
        message: 'Would you like to sync the metadata (save it) before exiting?',
        defaultId: 2,
        cancelId: 0
      });
      if (action === 2) {
        win.webContents.send('syncMetadata');
        electron.ipcMain.once('metadataSynced', () => {
          electron.app.showExitPrompt = false;
          win.close();
        });
      }
      if (action === 1) {
        electron.app.showExitPrompt = false;
        win.close();
      }
    }
  });
};

const windowStorage = {};
electron.app.whenReady().then(createWindow);

electron.ipcMain.on('storeValue', (e, [prop, value]) => {
  windowStorage[prop] = value;
  e.returnValue = true;
});
electron.ipcMain.on('storeValues', (e, obj) => {
  for (const prop in obj) {
    windowStorage[prop] = obj[prop];
  }
  e.returnValue = true;
});
electron.ipcMain.on('getValue', (e, prop) => {
  e.returnValue = windowStorage[prop];
});
electron.ipcMain.handle('getValueHandler', (e, prop) => {
  e.returnValue = windowStorage[prop];
});
electron.ipcMain.on('tagDeleted', (e, index) => {
  win.webContents.send('tagDeleted', index);
  e.returnValue = true;
});
electron.ipcMain.on('getValues', (e, props) => { // take array, return array: ["a","b"] => [1,2]
  let ret = [];
  for (const propIdx in props) {
    ret[propIdx] = windowStorage[props[propIdx]];
  }
  e.returnValue = ret;
});
electron.ipcMain.on('doneCreating', e => {
  win.webContents.send('doneCreating');
  e.returnValue = true;
});

electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
    electron.ipcMain.removeAllListeners(); // since Windows will not emit 'will-quit' sometimes, also removeAllListeners() here. The below is only for Darwin, but it's also a safeguard.
  }
});
electron.app.on('will-quit', () => {
  electron.globalShortcut.unregisterAll();
  electron.ipcMain.removeAllListeners();
});

electron.app.on('activate', () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
