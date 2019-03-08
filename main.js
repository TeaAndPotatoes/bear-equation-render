/* eslint-disable no-undef */
const { BrowserWindow, Menu, ipcMain } = require('electron');
const menubar = require('menubar');
const mjAPI = require('mathjax-node');


mjAPI.config({
  MathJax: {
    'fast-preview': {
      disabled: true,
    },
    AuthorInit: () => {
      MathJax.Hub.Register.StartupHook('End', () => {
        MathJax.Hub.processSectionDelay = 0;
        const demoSource = document.getElementById('math-input');
        const math = MathJax.Hub.getAllJax('render-output')[0];
        demoSource.addEventListener('input', () => {
          MathJax.Hub.Queue(['Text', math, demoSource.value]);
        });
      });
    },
  },
});
mjAPI.start();

const mb = menubar({
  width: 300,
  height: 250,
});

mb.on('ready', () => {
  const template = [{
    label: 'Application',
    submenu: [
      { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click: () => mb.app.quit() },
    ],
  }, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ],
  },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

mb.on('after-hide', () => {
  mb.app.hide();
});

// mb.on('after-create-window', () => {
//   mb.window.openDevTools({
//     mode: 'detach',
//   });
// });

let isErroring = false;
let errorTimer = null;
function startErrorState() {
  if (isErroring) return;

  isErroring = true;
  mb.window.webContents.send('error');
  errorTimer = setInterval(() => {
    mjAPI.start();
  }, 500);
}
function stopErrorState() {
  if (!isErroring || errorTimer == null) return;

  isErroring = false;
  clearInterval(errorTimer);
}

ipcMain.on('exportClicked', (event, arg) => {
  const win2 = new BrowserWindow({
    width: 0,
    height: 0,
    transparent: true,
    frame: false,
    show: false,

    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
    },
  });

  win2.loadURL(arg);
  setTimeout(() => {
    win2.close();
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
