'use strict';

describe('getContactsByPhoneNuber', function () {
    const action = require('../../lib/actions/getContactsByPhoneNumber');
    const sugar = require('node-sugarcrm-client');
    const nock = require('nock');

    let self;
    const cfg = {
        baseUrl: 'http://crm-demo.4crm.cz/service/v4_1/rest.php',
        userName: 'ttt',
        password: 'bbb'
    };

    describe('mock sugar library', () => {
        beforeEach(() => {
            spyOn(sugar, 'init').andCallFake(() => {});
            spyOn(sugar, 'login').andCallFake((cb) => {
                return cb('some-session-id');
            });
            spyOn(sugar, 'call').andCallFake((method, params, cb) => {
                const result = {
                    entry_list: [
                        {
                            id: 1,
                            name: 'Name 1'
                        },
                        {
                            id: 2,
                            name: 'Name 2'
                        }
                    ]
                };

                return cb(result);
            });
            self = jasmine.createSpyObj('self', ['emit']);
        });

        it('should get contacts', () => {
            runs(function(){
                action.process.call(self, {body: {}}, cfg, {});
            });

            waitsFor(function(){
                return self.emit.calls.length >= 3;
            });

            runs(function(){
                var calls = self.emit.calls;
                expect(calls.length).toEqual(3);
                expect(calls[0].args[0]).toEqual('snapshot');
                expect(calls[0].args[1]).toEqual({
                    sessionId: 'some-session-id',
                    lastUpdate: jasmine.any(Number)
                });
                expect(calls[1].args[0]).toEqual('data');
                expect(calls[1].args[1].body).toEqual([
                    {
                        id: 1,
                        name: 'Name 1'
                    },
                    {
                        id: 2,
                        name: 'Name 2'
                    }
                ]);
                expect(calls[2].args[0]).toEqual('end');

                expect(sugar.init).toHaveBeenCalledWith({
                    apiURL: cfg.baseUrl,
                    login: cfg.userName,
                    passwd: cfg.password
                });

                expect(sugar.login).toHaveBeenCalledWith(jasmine.any(Function));

                const expectedParams = {
                    session: 'some-session-id'
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

                expect(sugar.call).toHaveBeenCalledWith('get_entry_list', expectedParams, jasmine.any(Function));
            });
        });
    });

    describe('mock with nock', () => {
        beforeEach(() => {
            spyOn(sugar, 'init').andCallThrough();
            spyOn(sugar, 'login').andCallThrough();
            spyOn(sugar, 'call').andCallThrough();
            self = jasmine.createSpyObj('self', ['emit']);
        });

        it('should get contacts', () => {
            nock('http://crm-demo.4crm.cz/')
                .post('/service/v4_1/rest.php', body => body.method === 'login')
                .reply(200, JSON.stringify({id: 'some-session-id'}))
                .post('/service/v4_1/rest.php', body => body.method === 'get_entry_list')
                .reply(200, JSON.stringify(require('../data/contasts-list.json')));

            runs(function(){
                action.process.call(self, {body: {}}, cfg, {});
            });

            waitsFor(function(){
                return self.emit.calls.length >= 3;
            });

            runs(function(){
                var calls = self.emit.calls;
                expect(calls.length).toEqual(3);
                expect(calls[0].args[0]).toEqual('snapshot');
                expect(calls[0].args[1]).toEqual({
                    sessionId: 'some-session-id',
                    lastUpdate: jasmine.any(Number)
                });
                expect(calls[1].args[0]).toEqual('data');
                expect(calls[1].args[1].body).toEqual([
                    {
                        id: 1,
                        name: 'Name 1'
                    },
                    {
                        id: 2,
                        name: 'Name 2'
                    }
                ]);
                expect(calls[2].args[0]).toEqual('end');

                expect(sugar.init).toHaveBeenCalledWith({
                    apiURL: cfg.baseUrl,
                    login: cfg.userName,
                    passwd: cfg.password
                });

                expect(sugar.login).toHaveBeenCalledWith(jasmine.any(Function));

                const expectedParams = {
                    session: 'some-session-id'
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

                expect(sugar.call).toHaveBeenCalledWith('get_entry_list', expectedParams, jasmine.any(Function));
            });
        });
    });
});
