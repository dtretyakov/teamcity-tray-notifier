const ipc = require('electron').ipcRenderer;
const path = require('path');
const {shell} = require('electron');

ipc.on('test-notification', function () {
    createTestNotification();
});

function createTestNotification() {
    let notificationOptions = {
        title: 'Title from options',
        body: 'Lorem Ipsum Dolor Sit Amet'
    };

    // if (process.platform === 'darwin') {
    notificationOptions.icon = path.join(__dirname, 'icon.png');
    // }
    let notification = new Notification(notificationOptions.title, notificationOptions);
    
    notification.addEventListener('click', function() {
        shell.openExternal('https://github.com/dtretyakov/teamcity-tray-notifier');
    });
}
