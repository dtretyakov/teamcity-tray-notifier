/* teamcity-tray-notifier main process */
const electron = require('electron');
const {
    app,
    BrowserWindow,
    clipboard,
    dialog,
    ipcMain: ipc,
    Menu,
    Tray
} = electron;
const path = require('path');

let getServerUrl = require('./server-url');
let serverURL = null;

let windowManager = require('./window-manager');
let isAuthenticated = false;

let appIcon = null;
let contextMenu;
let pkg = require('./package');
let productNameVersion = pkg.productName + ' v' + pkg.version;

windowManager.registerWindow('__notifications', require('./notifications/notifications-window'));
windowManager.registerWindow('__server-config', require('./server-config/server-config'));
windowManager.registerWindow('__sockets', require('./socket-client/socket-client'));

let loginWin;

ipc.on('put-in-tray', putInTray);

ipc.on('remove-tray', () => {
    appIcon.destroy();
});

ipc.on('server-url-updated', (e, newServerURL) => {
    if (/[^/]$/.test(newServerURL)) {
        newServerURL += '/';
    }

    serverURL = newServerURL;

    doLogin();
});

ipc.on('show-configuration-window', () => {
    windowManager.getOrCreateWindow('__server-config');
});

app.on('ready', function() {
    putInTray();
    serverURL = getServerUrl();

    let notificationsWin = windowManager.getOrCreateWindow('__notifications');

    if (!serverURL) {
        notificationsWin.webContents.on('dom-ready', () => {
            notificationsWin.webContents.send('send-notification',
                productNameVersion,
                'click here to configure TeamCity server URL',
                'show-configuration-window'
            );
        });
    } else {
        doLogin();
    }
});

app.dock && app.dock.hide();

function putInTray() {
    const iconPath = path.join(__dirname,'icon.png');
    appIcon = new Tray(iconPath);
    contextMenu = Menu.buildFromTemplate([
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
                let notificationsWin = windowManager.getOrCreateWindow('__notifications');
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
    appIcon.setToolTip(`OFFLINE (${productNameVersion})`);

    let loginOrConnect = function () {
        if (isAuthenticated) {
            windowManager.getOrCreateWindow('__sockets', serverURL);
        } else {
            doLogin();
        }
    };

    /*
        TrayIcon:
        - open login/profile window on click
        - and context menu on right click
    */
    if (process.platform !== 'darwin') {
        appIcon.setContextMenu(contextMenu);
        appIcon.on('click', loginOrConnect);
    } else {
        appIcon.on('click', loginOrConnect);
        appIcon.on('right-click', () => {
            appIcon.popUpContextMenu(contextMenu);
        });
    }
}

function doLogin() {
    let loggingIn = false;
    loginWin = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false
        },
        show: true
    });

    let webContents = loginWin.webContents;

    loginWin.loadURL(`${serverURL}`);

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
                    windowManager.getOrCreateWindow('__sockets', serverURL);
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
            windowManager.getOrCreateWindow('__sockets', serverURL);
        }
    });

    webContents.on('did-fail-load', () => {
        dialog.showErrorBox('could not load login page', 'network error');
        loginWin.close();
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
    appIcon.setToolTip(`[${serverURL}]: ONLINE (${productNameVersion})`);
    contextMenu.items[2].enabled = !isAuthenticated;
    contextMenu.items[3].enabled = isAuthenticated;
}
