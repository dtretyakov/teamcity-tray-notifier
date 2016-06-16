const app = require('electron').app;

module.exports =  {
    productNameVersion: app.getName() + ' v' + app.getVersion(),
    findByLabel: function (target, label) {
        return target.filter(function (item) {
            return item.label === label;
        })[0];
    }
};
