var resource = helpers.requireBase('api/v1/resource');
var Client = helpers.requireBase('browser/client');

describe('api.v1.resource', function() {
  var testClient = {
    get: sinon.stub()
  };
  var testScope = { client: testClient };

  beforeEach(function() {
    testClient.get.reset();
  });

  describe('#request', function() {
    it('performs a request using client scope', function() {
      resource.request('get', testScope, '/test', {});
      assert.isTrue(testClient.get.calledOnce);
    });

    it('prefixes url with router path', function() {
      resource.request('get', testScope, '/test', {});
      assert.strictEqual(testClient.get.args[0][0], '/v1/test');
    });
  });

  describe('#get/put/post/delete', function() {
    var testMethod = 'get';
    var testUrl = '/test';
    var testData = { hello: 'world' };
    var testCallback = function(){};

    it('proxies get to request', function() {
      var requestStub = sinon.stub(resource, 'request');
      resource.get(testScope, testUrl, testData, testCallback);
      assert.deepEqual(requestStub.args[0], [
        'get', testScope, testUrl, testData, testCallback
      ]);
      requestStub.restore();
    });

    it('proxies put to request', function() {
      var requestStub = sinon.stub(resource, 'request');
      resource.put(testScope, testUrl, testData, testCallback);
      assert.deepEqual(requestStub.args[0], [
        'put', testScope, testUrl, testData, testCallback
      ]);
      requestStub.restore();
    });

    it('proxies post to request', function() {
      var requestStub = sinon.stub(resource, 'request');
      resource.post(testScope, testUrl, testData, testCallback);
      assert.deepEqual(requestStub.args[0], [
        'post', testScope, testUrl, testData, testCallback
      ]);
      requestStub.restore();
    });

    it('proxies delete to request', function() {
      var requestStub = sinon.stub(resource, 'request');
      resource.delete(testScope, testUrl, testData, testCallback);
      assert.deepEqual(requestStub.args[0], [
        'delete', testScope, testUrl, testData, testCallback
      ]);
      requestStub.restore();
    });
  });

  describe('#paramsFromArguments', function() {
    var testCallback;
    var testHandler;
    var testResult;

    beforeEach(function() {
      testCallback = function(){};
      testHandler = function() {
        return resource.paramsFromArguments(arguments, [
          { key: 'test1', type: 'string' },
          { key: 'test2', type: 'string' }
        ]);
      }
      testResult = {
        data: {
          test1: 'value1',
          test2: 'value2',
          foo: 'bar'
        },
        callback: testCallback
      };
    });

    it('returns data object with params', function() {
      var params = testHandler('value1', 'value2', { foo: 'bar' }, testCallback);
      assert.deepEqual(params, testResult);
    });

    it('merges with partial data', function() {
      var params = testHandler('value1', { test2: 'value2', foo: 'bar'}, testCallback);
      assert.deepEqual(params, testResult);
    });

    it('merges with all data', function() {
      var params = testHandler({ test1: 'value1', test2: 'value2', foo: 'bar'}, testCallback);
      assert.deepEqual(params, testResult);
    });

    it('merges with all data', function() {
      var params = testHandler({ test1: 'value1', test2: 'value2', foo: 'bar'}, testCallback);
      assert.deepEqual(params, testResult);
    });

    it('does not require data or callback', function() {
      var params = testHandler('value1', 'value2');
      delete testResult.data.foo;
      testResult.callback = undefined;
      assert.deepEqual(params, testResult);
    });

    it('throws if one or more args missing', function() {
      try {
        testHandler('value1', testCallback);
      } catch (err) {
        assert.ok(err.toString().match(/missing one or more arguments/));
      }
    });

    it('requires params by type', function() {
      try {
        testHandler(1, 2);
      } catch (err) {
        assert.ok(err.toString().match(/missing one or more arguments/));
      }
    });

    it('requires an array of types', function() {
      testHandler = function() {
        return resource.paramsFromArguments(arguments, [
          { key: 'test1', type: ['string', 'number'] },
          { key: 'test2', type: ['string', 'number'] }
        ]);
      }
      var params = testHandler('value', 2);
      assert.ok(params);
    });

  });
});
