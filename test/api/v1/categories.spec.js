var categories = helpers.requireBase('api/v1/categories');

describe('api.v1.categories', function() {
  helpers.api.init();
  helpers.api.describeMethods(categories, [
    {
      name: 'list',
      method: 'get',
      url: '/v1/categories'
    },
    {
      name: 'get',
      method: 'get',
      url: '/v1/categories/{id}',
      args: [ 'id' ]
    },
    {
      name: 'create',
      method: 'post',
      url: '/v1/categories'
    },
    {
      name: 'delete',
      method: 'delete',
      url: '/v1/categories/{id}',
      args: [ 'id' ]
    },
    {
      name: 'listProducts',
      method: 'get',
      url: '/v1/categories/{category_id}/products',
      args: [ 'category_id' ]
    }
  ]);
});
