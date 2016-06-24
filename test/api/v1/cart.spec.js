var cart = helpers.requireBase('api/v1/cart');

describe('api.v1.cart', function() {
  helpers.api.init();
  helpers.api.describeMethods(cart, [
    {
      name: 'get',
      method: 'get',
      url: '/v1/cart'
    },
    {
      name: 'update',
      method: 'put',
      url: '/v1/cart'
    },
    {
      name: 'create',
      method: 'post',
      url: '/v1/cart'
    },
    {
      name: 'addItem',
      method: 'post',
      url: '/v1/cart/add-item',
      args: [ 'product_id', 'variant_id', 'quantity' ]
    },
    {
      name: 'removeItem',
      method: 'post',
      url: '/v1/cart/remove-item',
      args: [ 'item_id' ]
    },
    {
      name: 'shipmentRating',
      method: 'get',
      url: '/v1/cart/shipment-rating'
    },
    {
      name: 'checkout',
      method: 'post',
      url: '/v1/cart/checkout'
    }
  ]);
});
