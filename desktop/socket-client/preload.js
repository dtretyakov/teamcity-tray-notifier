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
        let responseObject = JSON.parse(response.responseBody);
        let responseText = '';

        switch (responseObject.type) {
        case 'build':
            responseText = `${responseObject.build.buildName} #${responseObject.build.buildNumber} ${responseObject.build.status}`;
            break;
        case 'investigation':
            responseText = `investigation Tests: ${responseObject.investigation.tests.length}, Build Problems: ${responseObject.investigation.buildProblems.length}`;
            break;
        case 'label':
            responseText = `${responseObject.label.message}: ${responseObject.label.buildname}@${responseObject.label.root}`;
            break;
        case 'test':
            responseText = `Test "${responseObject.test.testName}" ${responseObject.test.state}`;
            break;
        }
        new Notification(`[${serverURL}]`, { body: responseText });
    };

    request.onClose = function () {
        global.ipc.send('toggle-socket-connection-status', false);
        new Notification(`${appName}`, { body: `Disconnected from [${serverURL}]` });
    };

    socket.subscribe(request);
};
