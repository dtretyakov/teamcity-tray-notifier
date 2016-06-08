/* teamcity-tray-notifier main process */
const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const ipc = electron.ipcMain;
const path = require('path');
const clipboard = require('electron').clipboard;
const dialog = require('electron').dialog;

let notificationsWin;
let loginWin;

let isAuthenticated = false;
let serverURL;

let appIcon = null;
let contextMenu;
let pkg = require('./package');
let productNameVersion = pkg.productName + ' v' + pkg.version;

if (!process.env.TEAMCITY_URL) {
    dialog.showErrorBox('Unexpected errro', 'TEAMCITY_URL is not specified');
    app.quit();
} else {
    serverURL = process.env.TEAMCITY_URL;
}

function putInTray() {
    const iconPath = path.join(__dirname,'icon.png');
    appIcon = new electron.Tray(iconPath);
    contextMenu = electron.Menu.buildFromTemplate([
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
                doLogin();
            },
            enabled: false
        },
        {
            label: 'Logout...',
            click: function () {
                logout();
            },
            enabled: false
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
    appIcon.setToolTip(productNameVersion);


    /*
        TrayIcon:
        - open login window on click
        - and context menu on right click
    */
    if (process.platform !== 'darwin') {
        appIcon.setContextMenu(contextMenu);
        appIcon.on('click', doLogin);
    } else {
        appIcon.on('click', doLogin);
        appIcon.on('right-click', () => {
            appIcon.popUpContextMenu(contextMenu);
        });
    }
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

function doLogin() {
    let loggingIn = false;
    loginWin = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false
    });

    loginWin.loadURL(`${serverURL}`);

    let webContents = loginWin.webContents;

    webContents.on('did-get-redirect-request', (evt, oldURL, newURL, isMainFrame, httpResponseCode) => {
        if (httpResponseCode == 302 && /login\.html/.test(newURL)) {
            isAuthenticated = false;
            toggleLoginLogoutStatus();
            loggingIn = true;
            loginWin.show();

            webContents.on('will-navigate', (evt, url) => {
                if (url === oldURL) {
                    isAuthenticated = true;
                    toggleLoginLogoutStatus();
                    loginWin.close();
                } else {
                    dialog.showErrorBox('Unexpected navigation', `Login page => '${url}'`);
                }
            });
        }
    });

    webContents.on('did-finish-load', () => {
        if (!loggingIn) {
            isAuthenticated = true;
            toggleLoginLogoutStatus();
            loginWin.close();
        }
    });

    loginWin.on('closed', () => {
        loginWin = null;
    });
}

function logout() {
    let win = new BrowserWindow({ show: false });

    win.loadURL(`${serverURL}ajax.html?logout=1`);

    let webContents = win.webContents;

    webContents.on('did-finish-load', () => {
        win.close();
        isAuthenticated = false;
        toggleLoginLogoutStatus();
    });
}

function toggleLoginLogoutStatus() {
    contextMenu.items[2].enabled = !isAuthenticated;
    contextMenu.items[3].enabled = isAuthenticated;
}

app.on('ready', function() {
    createNotificationsWindow();
    putInTray();
    doLogin();
});

app.dock && app.dock.hide();
