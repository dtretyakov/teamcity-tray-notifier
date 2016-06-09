const {BrowserWindow} = require('electron');

let notificationsWin;

function createNotificationsWindow() {
    notificationsWin = new BrowserWindow({
        width: 100,
        height: 100,
        show: false
    });

    notificationsWin.loadURL(`file://${__dirname}/test.html`);

    notificationsWin.on('closed', () => {
        notificationsWin = null;
    });

    return notificationsWin;
}

module.exports = createNotificationsWindow;
