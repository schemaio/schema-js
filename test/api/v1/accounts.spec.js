var accounts = helpers.requireBase('api/v1/accounts');

describe('api.v1.accounts', function() {
  helpers.api.init('v1');
  helpers.api.describeModel('accounts', accounts, {}, {
    relations: {
      addresses: true,
      cards: true,
      carts: true,
      orders: true
    }
  });
});
