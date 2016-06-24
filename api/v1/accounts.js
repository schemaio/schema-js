var resource = require('./resource');

module.exports = resource.defineModel('accounts', {}, {
  addresses: true,
  cards: true,
  carts: true,
  orders: true
});
