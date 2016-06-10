/* global windowManager: false */
const {
    BrowserWindow,
    dialog
} = require('electron');

let loggingIn = false;
let loginWin = null;

module.exports = function (serverURL) {
    loginWin = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false
        },
        show: true,
        title: "Login to TeamCity"
    });

    let webContents = loginWin.webContents;

    loginWin.loadURL(`${serverURL}`);

    webContents.on('did-get-redirect-request', (evt, oldURL, newURL, isMainFrame, httpResponseCode) => {
        if (httpResponseCode == 302 && /login\.html/.test(newURL)) {
            global.updateLoginStatus(false);
            loggingIn = true;
            loginWin.show();

            webContents.on('will-navigate', (evt, url) => {
                if (url === oldURL) {
                    global.updateLoginStatus(true);
                    loginWin.close();
                    windowManager.getOrCreateWindow('__sockets', serverURL);
                } else {
                    dialog.showErrorBox('Unexpected navigation', `Login page => '${url}'`);
                }
            });
        }
    });

    webContents.on('did-finish-load', () => {
        if (!loggingIn) {
            global.updateLoginStatus(true);
            loginWin.close();
            windowManager.getOrCreateWindow('__sockets', serverURL);
        }
    });

    webContents.on('did-fail-load', () => {
        dialog.showErrorBox('could not load login page', 'network error');
        loginWin.close();
    });

    loginWin.on('closed', () => {
        loginWin = null;
    });

    return loginWin;
};
