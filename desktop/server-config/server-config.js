const {
    BrowserWindow,
    ipcMain: ipc
} = require('electron');
const path = require('path');

let serverConfigurationWindow = null;

/*
    Creates page which sends `server-url-updated` event
*/
function createServerConfigurationWindow(serverURL) {
    const iconPath = path.join(__dirname,'../icon.png');
    serverConfigurationWindow = new BrowserWindow({
        width: 500,
        height: 200,
        frame: false,
        center: true,
        icon: iconPath,
        title: 'Configure Server URL'
    });

    serverConfigurationWindow.webContents.on('dom-ready', () => {
        serverConfigurationWindow.webContents.send('got-url', serverURL);
    });

    serverConfigurationWindow.loadURL(`file://${__dirname}/server-config.html`);

    ipc.on('server-url-updated', () => {
        serverConfigurationWindow.close();
    });

    serverConfigurationWindow.on('closed', () => {
        serverConfigurationWindow = null;
    });

    return serverConfigurationWindow;
}

module.exports = createServerConfigurationWindow;
