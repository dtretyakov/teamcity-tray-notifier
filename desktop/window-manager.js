let windows = {};

module.exports = {
    registerWindow: function (windowId, createFunction) {
        if (!windows[windowId]) {
            windows[windowId] = {
                create: createFunction,
                instance: null
            };
        }
    },
    getOrCreateWindow: function (windowId, ...createArguments) {
        if (!windows[windowId]) {
            throw new Error(`Unregistered window[${windowId}]`);
        }

        if (!windows[windowId].instance) {
            windows[windowId].instance = windows[windowId].create.apply(null, createArguments);
            windows[windowId].instance.on('closed', () => {
                windows[windowId].instance = null;
            });
        }

        return windows[windowId].instance;
    }
};
