var resource = require('./resource');

module.exports = resource.defineModel('categories', {
  listProducts: [
    'get', '/categories/{category_id}/products', [ 'category_id' ]
  ]
}, {
  relations: {
    products: true
  }
});
