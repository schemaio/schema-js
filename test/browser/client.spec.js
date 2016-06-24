var util = helpers.requireBase('lib/util');
var Client = helpers.requireBase('browser/client');
var Resource = helpers.requireBase('lib/resource');
var Record = helpers.requireBase('lib/record');
var Collection = helpers.requireBase('lib/collection');

describe('Client', function() {
  var testClient;

  beforeEach(function() {
    testClient = new Client('pk_test');
  });

  describe('#constructor', function() {
    it('defaults', function() {
      assert.deepEqual(testClient.params, {
        clientId: undefined,
        publicKey: 'pk_test',
        session: util.getCookie('session'),
        host: Client.defaults.host,
        timeout: Client.defaults.timeout,
        version: Client.defaults.version,
        versionPath: 'v' + Client.defaults.version
      });
    });

    it('throws without a public key', function() {
      try {
        new Client();
        assert.fail('no error', 'error');
      } catch (err) {
        assert.ok(err);
      }
    });

    it('throws with invalid public key', function() {
      try {
        new Client('test');
        assert.fail('no error', 'error');
      } catch (err) {
        assert.ok(err);
      }
    });

    it('applies api object', function() {
      assert.isDefined(testClient.session);
      assert.isDefined(testClient.account);
      assert.isDefined(testClient.cart);
    });
  });

  describe('#request', function() {
    var requestStub;
    var detectStub;

    before(function() {
      requestStub = sinon.stub(Client.prototype, 'requestWS');
      detectStub = sinon.stub(Client.prototype, 'detectRequestSupport', function() {
        testClient._supportsWS = true;
      });
    });
    beforeEach(function() {
      requestStub.reset();
      detectStub.reset();
    });
    after(function() {
      requestStub.restore();
      detectStub.restore();
    });

    it('detects client support on first call', function() {
      testClient.request('get', '/', {});
      assert(detectStub.calledOnce);
      assert(requestStub.calledOnce);
    });

    it('resolves promises in data', function() {
      return testClient.request('get', '/', {
        promisedVal: new Promise(function(resolve, reject) {
          setTimeout(resolve.bind(null, 'value'), 1);
        })
      }).then(function() {
        assert.deepEqual(requestStub.args[0][2], {
          promisedVal: 'value'
        });
      });
    });

    it('accepts callback in place of data', function() {
      testClient.request('get', '/', function(){});
      assert.strictEqual(requestStub.args[0][2], null);
    });
  });

  describe('#requestJSONP', function() {
    // TODO
  });

  describe('#requestCORS', function() {
    // TODO
  });

  describe('#requestWS', function() {
    // TODO
  });

  describe('#sendWSRequest', function() {
    // TODO
  });

  describe('#detectRequestSupport', function() {
    // TODO
  });

  describe('#respond', function() {
    it('responds with resource data', function() {
      var response = {
        $url: '/resource/foo',
        $data: {
          id: 1,
          name: 'foo'
        }
      };

      testClient.respond('get', 'url', response, function(err, resource, headers) {
        assert(resource instanceof Resource);
        assert.strictEqual(resource.toString(), headers.$url);
        assert.strictEqual(resource.id, headers.$data.id);
        assert.strictEqual(resource.name, headers.$data.name);
        assert.strictEqual(err, undefined);
        assert.strictEqual(this, testClient);
      });
    });

    it('responds with null data', function() {
      var response = {
        $data: null
      };
      testClient.respond('get', 'url', response, function(err, data, headers) {
        assert.strictEqual(data, null);
        assert.strictEqual(headers.$data, null);
        assert.strictEqual(this, testClient);
      });
    });

    it('responds with error', function() {
      var response = {
        $error: 'Internal Server Error'
      };
      testClient.respond('get', 'url', response, function(err, data, headers) {
        assert.strictEqual(data, undefined);
        assert.strictEqual(err.toString(), 'Error: Internal Server Error');
        assert.strictEqual(this, testClient);
      });
    });

    it('responds with nothing', function() {
      var response = null;
      testClient.respond('get', 'url', response, function(err, data, headers) {
        assert.strictEqual(err.toString(), 'Error: Empty response from server');
        assert.strictEqual(data, undefined);
        assert.strictEqual(headers.$status, 500);
        assert.strictEqual(this, testClient);
      });
    });
  });

  describe('#get/put/post/delete', function() {
    var requestStub;
    var requestArgs;

    before(function() {
      requestStub = sinon.stub(Client.prototype, 'request');
      requestArgs = ['url', 'data', 'callback'];
    });

    beforeEach(function() {
      requestStub.reset();
    });

    after(function() {
      requestStub.restore();
    });

    it('gets request', function() {
      testClient.get.apply(testClient, requestArgs);
      assert.strictEqual(requestStub.calledOnce, true);
      assert.deepEqual(requestStub.args[0][0], 'get');
      assert.deepEqual(requestStub.args[0].slice(1), requestArgs);
    });

    it('puts request', function() {
      testClient.put.apply(testClient, requestArgs);
      assert.strictEqual(requestStub.calledOnce, true);
      assert.deepEqual(requestStub.args[0][0], 'put');
      assert.deepEqual(requestStub.args[0].slice(1), requestArgs);
    });

    it('posts request', function() {
      testClient.post.apply(testClient, requestArgs);
      assert.strictEqual(requestStub.calledOnce, true);
      assert.deepEqual(requestStub.args[0][0], 'post');
      assert.deepEqual(requestStub.args[0].slice(1), requestArgs);
    });

    it('deletes request', function() {
      testClient.delete.apply(testClient, requestArgs);
      assert.strictEqual(requestStub.calledOnce, true);
      assert.deepEqual(requestStub.args[0][0], 'delete');
      assert.deepEqual(requestStub.args[0].slice(1), requestArgs);
    });
  });

  describe('#generateRequestId', function() {
    it('increments a global id each call', function() {
      var id1 = Client.generateRequestId();
      var id2 = Client.generateRequestId();
      var id3 = Client.generateRequestId();
      assert.strictEqual(id2, id1 + 1);
      assert.strictEqual(id3, id2 + 1);
    });
  });

  describe('#serializeData', function() {
    it('serializes null', function() {
      var result = Client.serializeData(null);
      assert.strictEqual(result, '');
    });

    it('serializes object', function() {
      var result = Client.serializeData({
        hello: 'world',
        foo: 'bar'
      });
      assert.strictEqual(result, 'hello=world&foo=bar');
    });

    it('serializes array', function() {
      var result = Client.serializeData([
        1, 2, 3
      ]);
      assert.strictEqual(result, '0=1&1=2&2=3');
    });

    it('serializes object array', function() {
      var result = Client.serializeData([
        { key1: 'val1'},
        { key2: 'val2'},
        { key3: 'val3'}
      ]);
      assert.strictEqual(result, '0%5Bkey1%5D=val1&1%5Bkey2%5D=val2&2%5Bkey3%5D=val3');
    });
  });

  describe('#createResource', function() {
    it('returns a new collection resource', function() {
      var result = {
        $data: {
          count: 1,
          results: [{}]
        }
      };
      var resource = Client.createResource('url', result, testClient);
      assert(resource instanceof Collection);
    });

    it('returns a new record resource', function() {
      var result = {
        $data: {}
      };
      var resource = Client.createResource('url', result, testClient);
      assert(resource instanceof Record);
    });
  });
});
