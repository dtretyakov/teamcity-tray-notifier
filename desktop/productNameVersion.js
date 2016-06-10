const app = require('electron').app;
module.exports =  app.getName() + ' v' + app.getVersion();
