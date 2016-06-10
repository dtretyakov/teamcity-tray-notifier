const { app } = require('electron');
const PARAMNAME = 'TEAMCITY_TRAY_NOTIFIER_URL';
const CONFIG_FILE = '.ttn.json';
const fs = require('fs');
const path = require('path');

let serverURL = null;
let confifFilePath = path.join(app.getPath('appData'), app.getName(), CONFIG_FILE);

// console.log(path.join(app.getPath('appData'), app.getName()));


module.exports = {

    getServerUrl: function () {
        serverURL = process.env[PARAMNAME];
        if (!serverURL) {
            try {
                let config = require(confifFilePath);
                serverURL = config.serverURL;
            } catch (e) {
                // TODO
            }
        }
        return serverURL;
    },

    saveServerUrl: function (serverURL) {
        fs.writeFileSync(confifFilePath, JSON.stringify({
            serverURL: serverURL
        }), 'utf8');
    }

};
