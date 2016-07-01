var SugarCRM = require('./sugarcrm');
const messages = require('elasticio-node').messages;

module.exports = function action (componentObject, method, msg, cfg, snapshot) {
    var self = componentObject;
    var body = msg.body;
    var id = body.id;
    delete body.id;
    var instance = new SugarCRM(cfg);
    instance
        .auth()
        .then(createOrUpdate)
        .then(emitData)
        .fail(onError)
        .finally(onEnd);

    function createOrUpdate() {
        return instance.createOrUpdate(method, body, id);
    }

    function emitData(entry) {
        console.log('Received data: %j', entry);

        self.emit('data', messages.newMessageWithBody(entry));
    }

    function onError (reason) {
        console.error(reason.stack || reason.message);
        self.emit('error', reason);
    }

    function onEnd () {
        self.emit('end');
    }
}