/* teamcity-tray-notifier main process */
const electron = require('electron');
const {
    app,
    ipcMain: ipc,
    Menu,
    Tray
} = electron;
const path = require('path');

let { getServerUrl, saveServerUrl } = require('./server-url');
let serverURL = null;

var windowManager = require('./window-manager');
global.windowManager = windowManager;
let isAuthenticated = false;

let appIcon = null;
let contextMenu;

let productNameVersion = require('./productNameVersion');
const constants = require('./constants');

windowManager.registerWindow('__notifications', require('./notifications/notifications-window'));
windowManager.registerWindow('__server-config', require('./server-config/server-config'));
windowManager.registerWindow('__sockets', require('./socket-client/socket-client'));
windowManager.registerWindow('__login', require('./login'));
windowManager.registerWindow('__logout', require('./logout'));
windowManager.registerWindow('__builds', require('./builds/builds'));

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
    saveServerUrl(serverURL);

    doLogin();
});

ipc.on('toggle-socket-connection-status', (e, isConnected) => {
    toggleSocketConnectionStatus(isConnected);
});

ipc.on('show-configuration-window', () => {
    windowManager.getOrCreateWindow('__server-config', serverURL);
});

ipc.on('close-configuration-window', () => {
    windowManager.getOrCreateWindow('__server-config').close();
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

app.on('browser-window-created',function(e,window) {
    window.setMenu(null);
});

if (process.platform === 'darwin') {
    app.dock && app.dock.hide();
}

function putInTray() {
    const iconPath = path.join(__dirname,'icon.png');
    let menuTemplate = require('./menu');
    findByLabel(menuTemplate, constants.loginLabel).click = doLogin;
    findByLabel(menuTemplate, constants.logoutLabel).click = logout;
    findByLabel(menuTemplate, constants.viewBuildsLabel).click = () => {
        windowManager.getOrCreateWindow('__builds', serverURL);
    };
    findByLabel(menuTemplate, constants.configureUrlLabel).click = () => {
        windowManager.getOrCreateWindow('__server-config', serverURL);
    };

    appIcon = new Tray(iconPath);

    contextMenu = Menu.buildFromTemplate(menuTemplate);
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
    findByLabel(contextMenu.items, constants.loginLabel).enabled = !isAuthenticated;
    findByLabel(contextMenu.items, constants.logoutLabel).enabled = isAuthenticated;
    findByLabel(contextMenu.items, constants.viewBuildsLabel).enabled = isAuthenticated;
}

function findByLabel(target, label) {
    return target.filter(function (item) {
        return item.label === label;
    })[0];
}
