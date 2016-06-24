var Record = helpers.requireBase('lib/record');

describe('Record', function() {
  var record;
  var testData;
  var testLinks;
  var testRecord;
  var testClient = {
    get: function() {}
  };

  beforeEach(function() {
    record = helpers.getFixture('record');
    testData = record.$data;
    testLinks = record.$links;
    testRecord = new Record(
      '/products/1',
      { $data: testData, $links: testLinks },
      testClient,
      'products'
    );
  });

  describe('#constructor', function() {
    it('defaults', function() {
      // TODO
    });
  });

  describe('#__initLinks', function() {
    it('applies record link functions', function() {
      assert.strictEqual(typeof testRecord.category, 'function');
      assert.strictEqual(typeof testRecord.category.get, 'function');
      assert.strictEqual(typeof testRecord.category.put, 'function');
      assert.strictEqual(typeof testRecord.category.post, 'function');
      assert.strictEqual(typeof testRecord.category.delete, 'function');
    });
  });

  describe('#__forEachLink', function() {
    it('iterates over each link + array', function() {
      var callbackCount = 0;
      testRecord.__forEachLink(testLinks, function(link) {
        callbackCount++;
      });
      assert.strictEqual(callbackCount, 3);
    });
  });

  describe('#__linkRequest', function() {
    it('execs a relative link request', function() {
      var called;
      var callUrl;
      var callData;
      var callback;
      testClient.get = function(url, data, cb) {
        called = true;
        callUrl = url;
        callData = data;
        callback = cb;
      };
      testRecord.__linkRequest('get', '/products/1', '/category', {
        hello: 'world'
      }, function() {});
      assert.strictEqual(called, true);
      assert.strictEqual(callUrl, '/products/1/category');
      assert.deepEqual(callData, { hello: 'world' });
      assert.strictEqual(typeof callback, 'function');
    });
  });

  describe('#__linkUrl', function() {
    it('removes query string from url', function() {
      testRecord.__url = '/products/1?test';
      var linkUrl = testRecord.__linkUrl('');
      assert.strictEqual(linkUrl, '/products/1/');
    });

    it('appends relative path to record url', function() {
      var linkUrl = testRecord.__linkUrl('category');
      assert.strictEqual(linkUrl, '/products/1/category');
    });
  });
});
