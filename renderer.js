const { ipcRenderer } = require('electron');
const html2canvas = require('html2canvas');

function disableTyping(key) {
  if (key.keyCode >= 37 && key.keyCode <= 40) {
    return; // arrow keys
  }
  if (key.keyCode === 8 || key.keyCode === 46) {
    return; // backspace (8) / delete (46)
  }
  key.preventDefault();
}

ipcRenderer.on('error', (_event, _data) => {
  document.getElementById('error-state-display').style.visibility = 'visible';
  document.getElementById('math-input').addEventListener('keydown', disableTyping);
});

ipcRenderer.on('textChangedReply', (_event, data) => {
  const div = document.getElementById('render-output');
  const styledSVG = `<svg id='svg'${data.svg.substring(4)}`;
  div.innerHTML = styledSVG;
  document.getElementById('error-state-display').style.visibility = 'hidden';
  document.getElementById('math-input').removeEventListener('keydown', disableTyping);
});

window.onload = () => {
  const mathInput = document.getElementById('math-input');

  mathInput.addEventListener('input', () => {
    const mathText = mathInput.value;
    ipcRenderer.send('textChanged', mathText);
  });

  document.getElementById('export-button').addEventListener('click', () => {
    html2canvas(document.getElementById('render-output')).then((canvas) => {
      const { length } = 'data:image/png;base64,';
      const id = document.getElementById('note-id').value;
      if (id.trim() === '') return;

      const data = encodeURIComponent(canvas.toDataURL('image/png').substr(length));
      const url = `bear://x-callback-url/add-file?filename=eq.png&id=${id}&mode=append&file=${data}&show_window=no`;
      ipcRenderer.send('exportClicked', url);
    });
  });
};
