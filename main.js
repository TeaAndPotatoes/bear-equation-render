const { BrowserWindow, ipcMain } = require('electron');
const menubar = require('menubar');
const mjAPI = require('mathjax-node');

mjAPI.start();

const mb = menubar({
  width: 300,
  height: 250,
});

mb.on('ready', () => {
  console.log('App is ready');
});

let isErroring = false;
let errorTimer = null;
function startErrorState() {
  if (isErroring) return;

  errorTimer = setInterval(() => {
    mjAPI.start();
  }, 500);
}
function stopErrorState() {
  if (!isErroring || errorTimer == null) return;
  clearInterval(errorTimer);
}

ipcMain.on('exportClicked', (event, arg) => {
  const win2 = new BrowserWindow({
    width: 0, height: 0, transparent: false, frame: true,
  });

  win2.loadURL(arg);
  setTimeout(() => {
    win2.close();
    mb.showWindow();
  }, 500);
});

ipcMain.on('textChanged', (event, data) => {
  try {
    mjAPI.typeset({
      svg: true, format: 'AsciiMath', linebreaks: true, width: 45, timeout: 1000, math: data,
    }, (mathRendered) => {
      event.sender.send('textChangedReply', mathRendered);
      stopErrorState();
    });
  } catch (e) {
    mb.window.webContents.send('error', 'Error state!');
    startErrorState();
  }
});
