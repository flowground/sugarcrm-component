describe('sugarCRM create or update opportunities', function () {
    var nock = require('nock');
    var action = require('../../lib/actions/createOrUpdateOpportunity');

    var cfg = {
        baseUrl: 'test.com'
    };

    var self;
    beforeEach(function() {
        self = jasmine.createSpyObj('self', ['emit']);
    });
    it('should emit msg, snapshot, end events on success create request', function () {
        nock('https://test.com/')
            .post('/rest/v10/oauth2/token')
            .reply(200, {access_token: 1})
            .post('/rest/v10/Opportunities')
            .reply(200, require('../data/list.out.json').records[0]);

        runs(function(){
            action.process.call(self, {body: {name: '1'}}, cfg, {});
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;
            expect(calls.length).toEqual(2);
            expect(calls[0].args[0]).toEqual('data');
            expect(calls[1].args[0]).toEqual('end');
        });
    });

    it('should emit msg, snapshot, end events on success update request', function () {
        nock('https://test.com/')
            .post('/rest/v10/oauth2/token')
            .reply(200, {access_token: 1})
            .put('/rest/v10/Opportunities/c24c4069-7092-b95d-c040-523cc74a3d06')
            .reply(200, require('../data/list.out.json').records[0]);

        runs(function(){
            action.process.call(
                self,
                {body: {id: 'c24c4069-7092-b95d-c040-523cc74a3d06', name: '1'}},
                cfg
            );
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;
            expect(calls.length).toEqual(2);
            expect(calls[0].args[0]).toEqual('data');
            expect(calls[1].args[0]).toEqual('end');
        });
    });

    it('should emit error, end events on failed auth', function () {
        nock('https://test.com/')
            .post('/rest/v10/oauth2/token')
            .reply(401);

        runs(function(){
            action.process.call(self, {body: {name: '1'}}, cfg, {});
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;
            expect(calls.length).toEqual(2);
            expect(calls[0].args[0]).toEqual('error');
            expect(calls[1].args[0]).toEqual('end');
        });
    });

    it('should emit error, end events on failed create request', function () {
        nock('https://test.com/')
            .post('/rest/v10/oauth2/token')
            .reply(200, {access_token: 1})
            .post('/rest/v10/Opportunities')
            .reply(501);

        runs(function(){
            action.process.call(self, {body: {name: '1'}}, cfg, {});
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;
            expect(calls.length).toEqual(2);
            expect(calls[0].args[0]).toEqual('error');
            expect(calls[1].args[0]).toEqual('end');
        });
    });
});
