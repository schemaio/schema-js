var products = helpers.requireBase('api/v1/products');

describe('api.v1.products', function() {
  helpers.api.init();
  helpers.api.describeMethods(products, [
    {
      name: 'list',
      method: 'get',
      url: '/v1/products'
    },
    {
      name: 'get',
      method: 'get',
      url: '/v1/products/{id}',
      args: [ 'id' ]
    },
    {
      name: 'create',
      method: 'post',
      url: '/v1/products'
    },
    {
      name: 'delete',
      method: 'delete',
      url: '/v1/products/{id}',
      args: [ 'id' ]
    },
    {
      name: 'listCategories',
      method: 'get',
      url: '/v1/products/{product_id}/categories',
      args: [ 'product_id' ]
    },
    {
      name: 'listRelated',
      method: 'get',
      url: '/v1/products/{product_id}/related',
      args: [ 'product_id' ]
    },
    {
      name: 'listReviews',
      method: 'get',
      url: '/v1/products/{product_id}/reviews',
      args: [ 'product_id' ]
    },
    {
      name: 'getReview',
      method: 'get',
      url: '/v1/products/{product_id}/reviews/{review_id}',
      args: [ 'product_id', 'review_id' ]
    },
    {
      name: 'createReview',
      method: 'post',
      url: '/v1/products/{product_id}/reviews',
      args: [ 'product_id', 'rating', 'comments' ]
    }
  ]);
});
