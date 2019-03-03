const { ipcRenderer, remote } = require('electron');

function onTextInput() {
  const mathText = document.getElementById('math-input').value;
  const mathRendered = ipcRenderer.send('textChanged', mathText);
}

function disableTyping(key) {
  if (key.keyCode >= 37 && key.keyCode <= 40) {
    return; // arrow keys
  }
  if (key.keyCode === 8 || key.keyCode === 46) {
    return; // backspace (8) / delete (46)
  }
  key.preventDefault();
}

ipcRenderer.on('error', (event, data) => {
  document.getElementById('error-state-display').style.visibility = 'visible';
  document.getElementById('math-input').addEventListener('keydown', disableTyping);
});

ipcRenderer.on('textChangedReply', (event, data) => {
  const div = document.getElementById('render-output');
  const styledSVG = `<svg id='svg'${data.svg.substring(4)}`;
  div.innerHTML = styledSVG;
  document.getElementById('error-state-display').style.visibility = 'hidden';
  document.getElementById('math-input').removeEventListener('keydown', disableTyping);
});

function onExportButtonClicked() {
  html2canvas(document.getElementById('render-output')).then((canvas) => {
    const { length } = 'data:image/png;base64,';
    const id = document.getElementById('note-id').value;
    if (id === '' || id === ' ') return;
    const data = encodeURIComponent(canvas.toDataURL('image/png').substr(length));
    const url = `bear://x-callback-url/add-file?filename=eq.png&id=${id}&mode=append&file=${data}&show_window=no`;
    ipcRenderer.send('exportClicked', url);
  });
}
