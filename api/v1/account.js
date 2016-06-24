var resource = require('./resource');

module.exports = resource.defineMethods('account', {
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
  addresses: resource.defineModel('account/addresses'),
  cards: resource.defineModel('account/cards'),
  carts: resource.defineModel('account/carts'),
  contacts: resource.defineModel('account/contacts'),
  orders: resource.defineModel('account/orders'),
  invoices: resource.defineModel('account/invoices'),
  subscriptions: resource.defineModel('account/subscriptions')
});
