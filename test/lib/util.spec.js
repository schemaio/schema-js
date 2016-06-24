var util = helpers.requireBase('lib/util');

describe('util', function() {
  describe('#inherits', function() {
    it('extends one prototype from another', function() {
      var proto1 = function(){};
      proto1.prototype.test2 = true;
      var proto2 = function(){};
      proto2.prototype.test2 = true;

      util.inherits(proto1, proto2);
      assert.strictEqual(proto1.prototype.test2, true);
      assert.deepEqual(proto1._super, proto2);
    });
  });

  describe('#getCookie', function() {
    it('gets the value of a cookie', function() {
      global.document = { cookie: 'hello=world;' };
      var hello = util.getCookie('hello');

      assert.strictEqual(hello, 'world');
    });
  });

  describe('#setCookie', function() {
    it('sets the value of a cookie', function() {
      global.document = { cookie: '' };
      util.setCookie('hello', 'world');

      assert.strictEqual(document.cookie, 'hello=world; path=/');
    });
  });

  describe('#getSessionId', function() {
    it('gets cookie session id', function() {
      global.document = { cookie: 'session=xyz' };
      var sessionId = util.getSessionId();

      assert.strictEqual(sessionId, 'xyz');
    });

    it('generates and saves session if not already cookie', function() {
      global.document = { cookie: '' };
      var sessionId = util.getSessionId();
      var sessionCookie = util.getCookie('session');

      assert.strictEqual(sessionId.length, 36);
      assert.strictEqual(sessionId, sessionCookie);
    });
  });

  describe('#generateUUIDv4', function() {
    it('generates a valid UUID', function() {
      var uuid = util.generateUUIDv4();

      assert.strictEqual(typeof uuid, 'string');
      assert.strictEqual(uuid.length, 36);
      assert.strictEqual(uuid.substring(8, 9), '-');
      assert.strictEqual(uuid.substring(13, 14), '-');
      assert.strictEqual(uuid.substring(18, 19), '-');
      assert.strictEqual(uuid.substring(23, 24), '-');
    });
  });

  describe('#promisifyData', function() {
    it('returns resolvers for each data promise', function() {
      var data = {
        promisedVal1: new Promise(function(resolve, reject) {
          setTimeout(resolve.bind(null, 'value1'), 1);
        }),
        promisedVal2: new Promise(function(resolve, reject) {
          setTimeout(resolve.bind(null, 'value2'), 1);
        })
      };
      var promises = util.promisifyData(data);

      return Promise.all(promises).then(function() {
        assert.strictEqual(data.promisedVal1, 'value1');
        assert.strictEqual(data.promisedVal2, 'value2');
      });
    });
  });
});
