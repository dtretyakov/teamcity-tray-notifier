/* teamcity-tray-notifier main process */
const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const ipc = electron.ipcMain;
const path = require('path');
const clipboard = require('electron').clipboard;

let notificationsWin;
let loginWin;

let appIcon = null;
let pkg = require('./package');
let productNameVersion = pkg.productName + ' v' + pkg.version;

function putInTray() {
    const iconPath = path.join(__dirname,'icon.png');
    appIcon = new electron.Tray(iconPath);
    const contextMenu = electron.Menu.buildFromTemplate([
        {
            label: productNameVersion,
            click: function () {
                clipboard.writeText(productNameVersion);
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Login...',
            click: function () {
                createLoginWindow();
            }
        },
        {
            type: 'separator'
        },
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

function createLoginWindow() {
    loginWin = new BrowserWindow({
        width: 450,
        height: 430
    });

    loginWin.loadURL('http://unit-631:8111/bs/win32/userStatus.html');
    // loginWin.loadURL('http://unit-631:8111/bs/win32/login.html');

    loginWin.on('closed', () => {
        loginWin = null;
    });
}

app.on('ready', function() {
    createNotificationsWindow();
    putInTray();
});

app.dock && app.dock.hide();
