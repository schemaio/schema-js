var resource = require('./resource');

module.exports = resource.defineMethods('cart', {
  get: [
    'get', '/cart'
  ],
  update: [
    'put', '/cart'
  ],
  create: [
    'post', '/cart'
  ],
  addItem: [
    'post', '/cart/add-item', [
      { key: 'product_id', type: 'string' },
      { key: 'variant_id', type: 'string', default: null },
      { key: 'quantity', default: 1 }
    ]
  ],
  removeItem: [
    'post', '/cart/remove-item', [ 'item_id' ]
  ],
  shipmentRating: [
    'get', '/cart/shipment-rating'
  ],
  checkout: [
    'post', '/cart/checkout'
  ]
}, {
  relations: {
    items: {
      add: 'addItem',
      remove: 'removeItem'
    }
  }
});
