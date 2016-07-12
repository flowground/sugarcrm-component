'use strict';

const request = require('request');
const Q = require('q');
var SugarCRM = require('./sugarcrm');
const messages = require('elasticio-node').messages;

exports.process = processAction;

function processAction(msg, cfg, snapshot) {
    const phone = msg.body.phone;
    const that = this;

    // URL: http://crm-demo.4crm.cz
    // Username: api
    // Password: Ipex2016

    var instance = new SugarCRM(cfg);
    instance
        .auth()
        .then(() => {
            var tokenData = instance.getTokenData();
            console.log(tokenData);
            that.emit('data', messages.newMessageWithBody({'test': '123'}));
        })
        .fail(onError)
        .finally(onEnd);


    // const opts = {
    //     url: '',
    //     json: true,
    // };
    //
    // Q.ninvoke(request, 'get', opts)
    //     .then(onResult)
    //     .catch(onError)
    //     .done(onEnd);

    // function onResult(response, body) {
    //
    // }

    function onError(err) {
        that.emit('error', err);
    }

    function onEnd() {
        that.emit('end');
    }


    // function auth() {
    //     function refreshToken () {
    //         var refreshParameters = {
    //             'grant_type': 'refresh_token',
    //             'client_id': cfg.clientID,
    //             'refresh_token': tokenData.refresh_token
    //         };
    //         makeRequest(
    //             '/oauth2/token',
    //             'POST',
    //             refreshParameters
    //         )
    //             .then(populateAuthData);
    //     }
    //
    //     var createParameters = {
    //         'grant_type': 'password',
    //         'client_id': cfg.clientID,
    //         'client_secret': '',
    //         'username': cfg.userName,
    //         'password': cfg.password,
    //         'platform': 'base'
    //     };
    //
    //     const url = 'http://crm-demo.4crm.cz/service/v4_1/rest.php';
    //
    //     return makeRequest(
    //         '/oauth2/token',
    //         'POST',
    //         createParameters
    //     )
    //     .then(populateAuthData);
    // }
}
