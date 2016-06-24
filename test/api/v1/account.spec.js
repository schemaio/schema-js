var account = helpers.requireBase('api/v1/account');

describe('api.v1.account', function() {
  helpers.api.init('v1');
  helpers.api.describeMethods('account', account, {
    get: [
      'get', '/account'
    ],
    update: [
      'put', '/account'
    ],
    create: [
      'post', '/account', [ 'email' ]
    ],
    login: [
      'post', '/account/login', [ 'email', 'password' ]
    ],
    logout: [
      'post', '/account/logout'
    ],
    recover: [
      'post', '/account/recover'
    ]
  }, {
    addresses: helpers.api.describeModel('account/{account_id}/addresses'),
    cards: helpers.api.describeModel('account/{account_id}/cards'),
    carts: helpers.api.describeModel('account/{account_id}/carts'),
    orders: helpers.api.describeModel('account/{account_id}/orders')
  });
});
