var resource = require('./resource');

module.exports = resource.defineModel('products', {
  listCategories: [
    'get', '/products/{product_id}/categories', [ 'product_id' ]
  ],
  listRelated: [
    'get', '/products/{product_id}/related', [ 'product_id' ]
  ],
  listReviews: [
    'get', '/products/{product_id}/reviews', [ 'product_id' ]
  ],
  getReview: [
    'get', '/products/{product_id}/reviews/{review_id}', [ 'product_id', 'review_id' ]
  ],
  createReview: [
    'post', '/products/{product_id}/reviews', [ 'product_id', 'rating', 'comments' ]
  ]
}, {
  categories: resource.defineModel('products/{product_id}/categories'),
  related: resource.defineModel('products/{product_id}/related'),
  reviews: resource.defineModel('products/{product_id}/reviews')
});
