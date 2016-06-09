let {
    BrowserWindow
} = require('electron');

let statsWin = null;

module.exports = function(serverURL) {
    statsWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false
        }
    });

    statsWin.loadURL(`${serverURL}profile.html`);

    statsWin.on('closed', () => {
        statsWin = null;
    });
};
