global.ipc = require('electron').ipcRenderer;

global.ipc.on('get-params', (e, paramObject) => {
    global.serverURL = paramObject.serverURL;
    global.appName = paramObject.appName;
});
/* global appName: false, serverURL: false */
global.initEverything = function () {

    /* global atmosphere:true */
    var socket = atmosphere;
    var transport = 'websocket';

    // We are now ready to cut the request
    var request = {
        url: document.location.origin + '/trayNotifier/notifications.html',
        contentType: 'application/json',
        trackMessageLength: true,
        shared: true,
        transport: transport,
        fallbackTransport: 'long-polling'
    };

    request.onOpen = function (response) {
        global.ipc.send('toggle-socket-connection-status', true);
        new Notification(`${appName}`, { body: `Connected to [${serverURL}] (${response.transport})` });
    };

    request.onTransportFailure = function (errorMsg) {
        new Notification(`[${serverURL}]`, { body: errorMsg });
    };

    request.onMessage = function (response) {
        new Notification(`[${serverURL}]`, { body: response.responseBody });
    };

    request.onClose = function () {
        global.ipc.send('toggle-socket-connection-status', false);
        new Notification(`${appName}`, { body: `Disconnected from [${serverURL}]` });
    };

    socket.subscribe(request);
};
