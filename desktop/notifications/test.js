const {
    ipcRenderer: ipc,
    shell
} = require('electron');
const path = require('path');

ipc.on('test-notification', function () {
    createTestNotification();
});

ipc.on('send-notification', (e, title, body, eventName) => {
    showNotification({
        title,
        body,
        clickCallback: eventName ? function () {
            ipc.send(eventName);
        } : null
    });
});

function createTestNotification() {
    let notificationOptions = {
        title: 'Title from options',
        body: 'Lorem Ipsum Dolor Sit Amet',
        icon: path.join(__dirname, 'icon.png'),
        clickCallback: () => {
            shell.openExternal('https://github.com/dtretyakov/teamcity-tray-notifier');
        }
    };

    showNotification(notificationOptions);
}

function showNotification(options) {
    let {
        title, clickCallback
    } = options;

    let notificationOptions = { body: options.body};

    if (process.platform === 'darwin' && options.icon) {
        notificationOptions.icon = options.icon;
    }

    let notification = new Notification(title, notificationOptions);

    if (clickCallback) {
        notification.addEventListener('click', clickCallback);
    }
}

document.querySelector('#btn').addEventListener('click', createTestNotification);
