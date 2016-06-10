const PARAMNAME = 'TEAMCITY_TRAY_NOTIFIER_URL';
let serverURL;

module.exports = {

    getServerUrl: function () {
        serverURL = process.env[PARAMNAME];
        return serverURL;
    },

    saveServerUrl: function (serverURL) {
        process.env[PARAMNAME] = serverURL;
    }

};
