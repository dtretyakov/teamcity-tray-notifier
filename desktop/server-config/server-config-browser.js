const ipc = require('electron').ipcRenderer;
let btn = document.querySelector('#btn');
let closeButton = document.querySelector('#close');
let serverUrlInput = document.querySelector('#server-url');

btn.disabled = !serverUrlInput.validity.valid;

btn.addEventListener('click', () => {
    ipc.send('server-url-updated', serverUrlInput.value);
});

var dbg = document.querySelector('.debug');

serverUrlInput.addEventListener('input', function() {
    btn.disabled = !serverUrlInput.validity.valid;
    dbg.innerHTML = serverUrlInput.validity.valid;
    dbg.innerHTML += validateURL(serverUrlInput.value);
});

closeButton.addEventListener('click', () => {
    ipc.send('close-configuration-window');
});

function validateURL(url) {
    var parser = document.createElement('a');
    try {
        parser.href = url;
        return !!parser.hostname;
    } catch (e) {
        return false;
    }
}

ipc.on('got-url', (e, url) => {
    serverUrlInput.value = url;
});

serverUrlInput.focus();
