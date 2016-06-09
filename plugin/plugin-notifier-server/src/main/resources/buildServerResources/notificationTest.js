$(function () {
    "use strict";

    var header = $('#header');
    var content = $('#content');
    var status = $('#status');
    var socket = atmosphere;
    var transport = 'websocket';

    // We are now ready to cut the request
    var request = {
        url: document.location.origin + '/trayNotifier.html',
        contentType: "application/json",
        trackMessageLength: true,
        shared: true,
        transport: transport,
        fallbackTransport: 'long-polling'
    };

    request.onOpen = function (response) {
        debugger;
        status.text('Connected: ' + response.transport);
    };

    request.onTransportFailure = function (errorMsg, request) {
        status.text(errorMsg);
    };

    request.onMessage = function (response) {
        debugger;
        content.text(response.responseBody);
    };

    request.onClose = function (response) {
        status.text("closed");
    };

    socket.subscribe(request);
});