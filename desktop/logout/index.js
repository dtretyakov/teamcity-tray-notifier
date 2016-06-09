const { BrowserWindow } = require('electron');
let win = null;

module.exports = function (serverURL) {
    win = new BrowserWindow({ show: false });

    win.loadURL(`${serverURL}ajax.html?logout=1`);

    let webContents = win.webContents;

    webContents.on('did-finish-load', () => {
        global.updateLoginStatus(false);
        win.close();
    });

    return win;
};
