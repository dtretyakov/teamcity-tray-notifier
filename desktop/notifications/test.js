const {
    ipcRenderer: ipc
} = require('electron');
const path = require('path');

ipc.on('test-notification', function () {
    createTestNotification();
});

ipc.on('send-notification', (e, title, body, eventName, eventParams) => {
    showNotification({
        title,
        body,
        clickCallback: eventName ? function () {
            ipc.send(eventName, eventParams);
        } : null
    });
});

function createTestNotification() {
    let notificationOptions = {
        title: 'Title from options',
        body: 'Lorem Ipsum Dolor Sit Amet',
        icon: path.resolve(path.join(__dirname, '../icon@2x.png')),
        clickCallback: () => {
            ipc.send('open-url-in-browser', 'https://github.com/dtretyakov/teamcity-tray-notifier');
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
