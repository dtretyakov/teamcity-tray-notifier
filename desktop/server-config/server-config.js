const {
    BrowserWindow,
    ipcMain: ipc
} = require('electron');

let serverConfigurationWindow = null;

/*
    Creates page which sends `server-url-updated` event
*/
function createServerConfigurationWindow() {
    serverConfigurationWindow = new BrowserWindow({
        width: 500,
        height: 300,
        frame: false
    });

    serverConfigurationWindow.loadURL(`file://${__dirname}/server-config.html`);

    ipc.on('server-url-updated', () => {
        serverConfigurationWindow.close();
    });

    serverConfigurationWindow.on('closed', () => {
        serverConfigurationWindow = null;
    });
}

module.exports = createServerConfigurationWindow;
