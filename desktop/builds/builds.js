let {
    BrowserWindow
} = require('electron');

let buildsWin = null;

module.exports = function(serverURL) {
    buildsWin = new BrowserWindow({
        height: 150,
        webPreferences: {
            nodeIntegration: false
        },
        frame: false
    });

    buildsWin.loadURL(`${serverURL}trayNotifier/viewBuilds.html`);

    buildsWin.on('closed', () => {
        buildsWin = null;
    });

    return buildsWin;
};
