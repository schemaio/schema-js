var Resource = helpers.requireBase('lib/resource');

describe('Resource', function() {
  var record;
  var testData;
  var testResource;
  var testClient = {
    get: function() {}
  };

  beforeEach(function() {
    record = helpers.getFixture('record');
    testData = record.$data;
    testLinks = record.$links;
    testResource = new Resource(
      '/products/1',
      { $data: testData, $links: testLinks },
      testClient
    );
  });

  describe('#constructor', function() {
    it('defaults', function() {
      assert.strictEqual(testResource.__url, '/products/1');
      assert.deepEqual(testResource.__client, testClient);
      assert.deepEqual(testResource.__data, testData);
      assert.deepEqual(testResource.$links, testLinks);
    });

    it('inits data', function() {
      assert.strictEqual(testResource.name, testData.name);
    });
  });

  describe('#__initData', function() {
    it('sets attributes from data', function() {
      testData = { hello: 'world' };
      testResource.__initData(testData);
      assert.deepEqual(testResource.__data, testData);
      assert.strictEqual(testResource.hello, testData.hello);
    });
  });

  describe('#toObject', function() {
    it('returns a plain object with data', function() {
      var obj = testResource.toObject();
      assert.deepEqual(obj, testData);
    });
  });

  describe('#toJSON', function() {
    it('returns a JSON string with data', function() {
      var json = testResource.toJSON();
      assert.deepEqual(json, JSON.stringify(testData));
    });
  });

  describe('#toString', function() {
    it('returns the resource url', function() {
      var str = testResource.toString();
      assert.deepEqual(str, testResource.__url);
    });
  });
});
