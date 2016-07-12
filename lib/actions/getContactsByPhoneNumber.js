'use strict';

const request = require('request');
const Q = require('q');
// var SugarCRM = require('./sugarcrm');
const messages = require('elasticio-node').messages;
var sugar = require('node-sugarcrm-client');

const MAX_SESSION_ID_TTL = 1000 * 60; //1min

exports.process = processAction;

function processAction(msg, cfg, snapshot) {
    // const phone = msg.body.phone;
    const that = this;

    // URL: http://crm-demo.4crm.cz
    // Username: api
    // Password: Ipex2016 / 16de84b72ab4f68b7f9bc30c5727c10e

    Q.fcall(init)
        .then(initSessionId)
        .then(getContacts)
        .then(emitData)
        .catch(onError)
        .done(onEnd);

    function init() {
        console.log('About to init...');
        sugar.init(
            {
                apiURL:  "http://crm-demo.4crm.cz/service/v4_1/rest.php",
                login:   "api",
                passwd:  "Ipex2016"
            }
        );
    }

    function initSessionId() {
        console.log('About to get session ID');
        let deferred = Q.defer();
        if (snapshot.sessionId && (snapshot.lastUpdate - Date.now() < MAX_SESSION_ID_TTL)) {
            console.log('Seems like sessionId is still valid');
            return Q.resolve(snapshot.sessionId);
        }

        console.log('Going to retrieve new sessionId');
        sugar.login(function(newSessionID){
            if (newSessionID != 'undefined') {
                // If you are here, you got a session ID
                // and you can add all your query here
                snapshot.sessionId = newSessionID;
                snapshot.lastUpdate = Date.now();

                console.log('Snapshot last update:', snapshot.lastUpdate);

                that.emit('snapshot', snapshot);
                deferred.resolve(newSessionID);
            } else {
                console.error("can't login, check your credentials");
                deferred.reject(new Errro('Failed to retrieve session ID'));
            }
        });

        return deferred.promise;
    }

    function getContacts(sessionID) {
        console.log('Your session ID is', sessionID);
        let deferred = Q.defer();

        const params = {
            session: sessionID
            , module_name: "Accounts"
            , query: ""
            , order_by: ''
            , offset: '0'
            , select_fields: ['id', 'name']
            , link_name_to_fields_array: []
            , max_results: 5
            , deleted: '0'
            , Favorites: false
        };

        console.log('About to get contacts..');

        sugar.call("get_entry_list", params, function(res, err) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            } else {
                console.log('Received result %j', res);
                deferred.resolve(res.entry_list);
            }
        });

        return deferred.promise;
    }

    function emitData(data) {
        // console.log('Emitting data %j', data);
        that.emit('data', messages.newMessageWithBody(data));
    }

    function onError(err) {
        that.emit('error', err);
    }

    function onEnd() {
        that.emit('end');
    }
}
