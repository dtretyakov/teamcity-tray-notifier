const ipc = require('electron').ipcRenderer;
let btn = document.querySelector('#btn');
let closeButton = document.querySelector('#close');
let serverUrlInput = document.querySelector('#server-url');
let serverUrlLabel = document.querySelector('.server-url__label');

btn.disabled = !serverUrlInput.validity.valid;

btn.addEventListener('click', () => {
    ipc.send('server-url-updated', serverUrlInput.value);
});

// let dbg = document.querySelector('.debug');
let inputHandler = function () {
    if (serverUrlInput.validity.valid || serverUrlInput.validity.customError) {
        validateURL(serverUrlInput.value);
    }

    btn.disabled = !serverUrlInput.validity.valid;
    serverUrlLabel.innerText = serverUrlInput.validationMessage;
};

serverUrlInput.addEventListener('input', inputHandler);

closeButton.addEventListener('click', () => {
    ipc.send('close-configuration-window');
});

function validateURL(url) {
    let parser = document.createElement('a');
    let isValid = false;
    try {
        parser.href = url;

        if (!(parser.protocol && /^https?:$/i.test(parser.protocol))) {
            isValid = false;
            serverUrlInput.setCustomValidity('"http(s):" protocol is required');
        } else {
            isValid = true;
            serverUrlInput.setCustomValidity('');
        }
        return ;
    } catch (e) {
        isValid = false;
    }

    return isValid;
}

ipc.on('got-url', (e, url) => {
    serverUrlInput.value = url;
    inputHandler();
});

serverUrlInput.focus();
