/* teamcity-tray-notifier main process */
const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const ipc = electron.ipcMain;
const path = require('path');

let win;
let notificationsWin;
let appIcon = null;

function putInTray() {
    const iconPath = path.join(__dirname,'icon.png');
    appIcon = new electron.Tray(iconPath);
    const contextMenu = electron.Menu.buildFromTemplate([
        {
            label: 'Send test notification',
            click: function () {
                notificationsWin.webContents.send('test-notification');
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: function () {
                app.quit();
            }
        }
    ]);
    appIcon.setToolTip('teamcity-tray-notifier');
    appIcon.setContextMenu(contextMenu);
}

ipc.on('put-in-tray', putInTray);

ipc.on('remove-tray', () => {
    appIcon.destroy();
});

function createNotificationsWindow() {
    notificationsWin = new BrowserWindow({
        width: 100,
        height: 100,
        show: false
    });

    notificationsWin.loadURL(`file://${__dirname}/notifications/test.html`);

    notificationsWin.on('closed', () => {
        notificationsWin = null;
    });
}

app.on('ready', function() {
    createNotificationsWindow();
    putInTray();
});

app.dock.hide();
