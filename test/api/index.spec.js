var api = helpers.requireBase('api/index');

describe('api', function() {
  describe('#create', function() {
    it('create an object of api methods', function() {
      var testClient = {};
      var testApi = api.create(testClient, 'v1');
      // session
      assert.ok(testApi.session);
      assert.ok(testApi.session.get);
      assert.ok(testApi.session.update);
      // account
      assert.ok(testApi.account);
      assert.ok(testApi.account.get);
      assert.ok(testApi.account.update);
      assert.ok(testApi.account.login);
      assert.ok(testApi.account.logout);
      assert.ok(testApi.account.recover);
      // cart
      assert.ok(testApi.cart);
      assert.ok(testApi.cart.get);
      assert.ok(testApi.cart.update);
      assert.ok(testApi.cart.addItem);
      assert.ok(testApi.cart.removeItem);
      assert.ok(testApi.cart.checkout);
      // card
      assert.ok(testApi.card.createToken);
      assert.ok(testApi.card.validate);
      assert.ok(testApi.card.cardExpiry);
      assert.ok(testApi.card.cardType);
      assert.ok(testApi.card.validateCardNumber);
    });
  });

  describe('#apply', function() {
    it('apply api methods to another object', function() {
      var testClient = {};
      api.apply(testClient, testClient, 'v1');
      assert.ok(testClient.session);
    });
  });

  describe('#getRouter', function() {
    it('returns registered api router', function() {
      var router = api.getRouter('v1');
      assert.ok(router);
      assert.ok(router.session);
    });
  });

  describe('#bindMethods', function() {
    it('binds proto methods to client and object props', function() {
      var object = {};
      var testClient = {};
      var proto = {
        test: {
          get: function(){
            return this.client;
          }
        }
      };
      api.bindMethods(testClient, proto, object);
      assert.ok(object.test);
      assert.ok(object.test.get);
      assert.strictEqual(object.test.get(), testClient);
    });

    it('returns a new object if not passed', function() {
      var testClient = {};
      var proto = {
        test: {
          get: function(){
            return this.client;
          }
        }
      };
      var object = api.bindMethods(testClient, proto);
      assert.ok(object.test);
      assert.ok(object.test.get);
      assert.strictEqual(object.test.get(), testClient);
    });
  });
});
