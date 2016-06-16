const {
    app,
    BrowserWindow
} = require('electron');
let path = require('path');

let win = null;

module.exports = function (serverURL) {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.resolve(path.join(__dirname, 'preload.js')),
            nodeIntegration: false
        },
        show: true
    });

    let webContents = win.webContents;
    webContents.on('dom-ready', () => {
        webContents.executeJavaScript('initEverything();', () => {
            webContents.send('get-params', {
                serverURL,
                appName: app.getName()
            });
        });
    });

    win.loadURL(`${serverURL}profile.html`);

    // FIXME: ugly hack to prevent Atmosphere from freezing window forever
    win.on('unresponsive', () => {
        win.destroy();
    });

    win.on('closed', () => {
        win = null;
    });

    return win;
};
