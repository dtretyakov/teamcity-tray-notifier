const {
    BrowserWindow,
    ipcMain: ipc
} = require('electron');

let serverConfigurationWindow = null;

/*
    Creates page which sends `server-url-updated` event
*/
function createServerConfigurationWindow(serverURL) {
    serverConfigurationWindow = new BrowserWindow({
        width: 500,
        height: 200,
        frame: false
    });

    serverConfigurationWindow.loadURL(`file://${__dirname}/server-config.html`);

    serverConfigurationWindow.webContents.on('dom-loaded', () => {
        serverConfigurationWindow.webContents.send('got-url', serverURL);
    });

    ipc.on('server-url-updated', () => {
        serverConfigurationWindow.close();
    });

    serverConfigurationWindow.on('closed', () => {
        serverConfigurationWindow = null;
    });

    return serverConfigurationWindow;
}

module.exports = createServerConfigurationWindow;
