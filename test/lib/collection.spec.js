var Record = helpers.requireBase('lib/record');
var Collection = helpers.requireBase('lib/collection');

describe('Collection', function() {
  var coll;
  var testData;
  var testColl;

  beforeEach(function() {
    coll = helpers.getFixture('collection');
    testData = coll.$data;
    testColl = new Collection('/products', {$data: testData});
  });

  describe('#constructor', function() {
    it('defaults', function() {
      assert.strictEqual(testColl.count, testData.count);
      assert.strictEqual(testColl.page, testData.page);
      assert.deepEqual(testColl.pages, testData.pages);
      assert.strictEqual(testColl.length, testData.results.length);
      assert.deepEqual(testColl.results, testData.results);
    });
  });

  describe('#__buildRecords', function() {
    it('returns null without array', function() {
      var recs = testColl.__buildRecords(null, null);
      assert.strictEqual(recs, null);
    });

    it('returns array of records', function() {
      var recs = testColl.__buildRecords('/products', {$data: testData});
      assert.isArray(recs);
      recs.forEach(function(rec) {
        assert.ok(rec instanceof Record);
      });
    });

    it('truncates query string from url', function() {
      var recs = testColl.__buildRecords('/products', {$data: testData});
      assert.strictEqual(recs[0].toString(), '/products/1');
    });
  });

  describe('#each', function() {
    it('calls back for each record with context', function() {
      var callbackCount = 0;
      testColl.each(function(rec) {
        callbackCount++;
        assert.strictEqual(rec.id, callbackCount);
        assert.strictEqual(this, testColl);
      });
      assert.strictEqual(callbackCount, 3);
    });
  });

  describe('#toObject', function() {
    it('returns a plain object with params', function() {
      var obj = testColl.toObject();
      assert.strictEqual(testColl.count, obj.count);
      assert.strictEqual(testColl.page, obj.page);
      assert.deepEqual(testColl.pages, testData.pages);
      assert.deepEqual(testColl.results, testData.results);
    });
  });
});
