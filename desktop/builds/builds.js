let {
    BrowserWindow
} = require('electron');
const path = require('path');

let buildsWin = null;

module.exports = function(serverURL) {
    const iconPath = path.join(__dirname,'../icon.png');
    buildsWin = new BrowserWindow({
        width: 500,
        height: 300,
        webPreferences: {
            nodeIntegration: false
        },
        frame: false,
        icon: iconPath
    });

    buildsWin.loadURL(`${serverURL}trayNotifier/viewBuilds.html`);

    buildsWin.on('closed', () => {
        buildsWin = null;
    });

    return buildsWin;
};
