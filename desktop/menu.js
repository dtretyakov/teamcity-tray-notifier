/* global windowManager: false */
const {
    app,
    clipboard
} = require('electron');
const constants = require('./constants');

let productNameVersion = require('./productNameVersion');

module.exports = [
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
        label: constants.configureUrlLabel
    },
    {
        label: constants.loginLabel,
        enabled: false
    },
    {
        label: constants.viewBuildsLabel,
        enabled: false
    },
    {
        label: constants.logoutLabel,
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
];
