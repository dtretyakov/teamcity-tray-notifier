/* teamcity-tray-notifier main process */
const electron = require('electron');
const {
    app,
    clipboard,
    ipcMain: ipc,
    Menu,
    Tray
} = electron;
const path = require('path');

let getServerUrl = require('./server-url');
let serverURL = null;

var windowManager = require('./window-manager');
global.windowManager = windowManager;
let isAuthenticated = false;

let appIcon = null;
let contextMenu;

let productNameVersion = app.getName() + ' v' + app.getVersion();

windowManager.registerWindow('__notifications', require('./notifications/notifications-window'));
windowManager.registerWindow('__server-config', require('./server-config/server-config'));
windowManager.registerWindow('__sockets', require('./socket-client/socket-client'));
windowManager.registerWindow('__login', require('./login'));
windowManager.registerWindow('__logout', require('./logout'));

global.updateLoginStatus = (newLoginStatus) => {
    isAuthenticated = newLoginStatus;
    toggleLoginLogoutStatus();
};

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

ipc.on('toggle-socket-connection-status', (e, isConnected) => {
    toggleSocketConnectionStatus(isConnected);
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
    toggleSocketConnectionStatus(false);

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
    windowManager.getOrCreateWindow('__login', serverURL);
}

function logout() {
    windowManager.getOrCreateWindow('__logout', serverURL);
}

function toggleSocketConnectionStatus(isConnected) {
    appIcon.setToolTip(isConnected ?
        `[${serverURL}]: ONLINE (${productNameVersion})` :
        `OFFLINE (${productNameVersion})`);
}

function toggleLoginLogoutStatus() {

    contextMenu.items[2].enabled = !isAuthenticated;
    contextMenu.items[3].enabled = isAuthenticated;
}
