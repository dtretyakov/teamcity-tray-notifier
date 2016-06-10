var Win32 = {};

Win32.UpdateTitle = function (title, base_uri) {
    var trimString = function (x) {
        if (x.length > 25) {
            return x.substring(0, 22) + "...";
        } else {
            return x;
        }
    };
    $(title).innerHTML += " (" + trimString(base_uri) + ")";
};

Win32.Extension = {
    setAuthorizedUser: function (userId) {
        try {
            window.external.SetAuthorizedUser(parseInt(userId, 10));
        }
        catch (e) {
            //alert(e);
        }
    },

    popupNotification: function (eventTypeId, message, detailLink, isPersonal, time, messageId) {
        try {
            window.external.PopupNotification(eventTypeId, message, detailLink, isPersonal, time, messageId);
        } catch (e) {
            //NOP
        }
    },

    setBuildsStatus: function (status) {
        try {
            window.external.SetBuildsStatus(status);
        } catch (e) {
            //NOP
        }
    },

    setUpdateRequired: function (isUpdateRequired) {
        try {
            window.external.SetUpdateRequired(isUpdateRequired);
        } catch (e) {
            //alert(e);
        }
    },

    getNotifierVersion: function () {
        try {
            return window.external.GetNotifierVersion();
        } catch (e) {
            return "";
        }
    },

    closeMe: function () {
        try {
            window.external.CloseMe();
        }
        catch (e) {
            //alert(e);
        }
    },

    downloadInstallUpdate: function () {
        try {
            window.external.DownloadInstallUpdate();
            return false;
        } catch (e) {
            return true;
        }
    },

    handleLoad: function () {
        //compartibility with old notifier.
        try {
            window.external.ThisIsTeamCityPage();
        } catch (e) {
            //NOP
        }
    },

    handleUnload: function () {
        //compartibility with old notifier.
        try {
            window.external.ResetTeamCityPageStatus();
        } catch (e) {
            //NOP
        }
    }
};


Win32.Messages = {

    refreshInterval: function () {
        return 5000;
    },

    runActions: function (acts) {
        setTimeout(function () {
            for (var i = 0; i < acts.length; i++) {
                try {
                    (acts[i])();
                } catch (e) {
                    //NOP
                }
            }
        }, 100);
    },

    updateState: function (nextId, version, status, messages) {
        var STATE = {};
        STATE.serverVersion = version;

        var actions =
            [
                function () {
                    $("serverVersion").innerHTML = STATE.serverVersion;
                },

                function () {
                    STATE.notifierVersion = "" + Win32.Extension.getNotifierVersion();
                },

                function () {
                    $("notifierVersion").innerHTML = STATE.notifierVersion;
                },

                function () {
                    if (STATE.notifierVersion != STATE.serverVersion) {
                        Win32.Extension.setUpdateRequired(true);
                    } else {
                        Win32.Extension.setUpdateRequired(false);
                    }
                },

                function () {
                    Win32.Extension.setBuildsStatus(status);
                }
            ];

        for (var i = 0; i < messages.length; i++) {
            actions.push(messages[i]);
        }

        actions.push(function () {
            setTimeout(function () {
                $("notification").refresh(null, "timestamp=" + nextId);
            }, Win32.Messages.refreshInterval());
        });

        Win32.Messages.runActions(actions);
    },

    notifyAction: function (eventId, message, url, isPersonal, time, modCount) {
        return function () {
            Win32.Extension.popupNotification(eventId, message, url, isPersonal, time, modCount);
        }
    }
};

$j(document).ready(function () {
    Win32.Extension.handleLoad();
});

$j(document).unload(function () {
    Win32.Extension.handleUnload();
});

