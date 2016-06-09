const PARAMNAME = 'TEAMCITY_TRAY_NOTIFIER_URL';
let serverURL;

module.exports = function () {
    serverURL = process.env[PARAMNAME];

    return serverURL;
};
