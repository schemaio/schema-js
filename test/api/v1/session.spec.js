var session = helpers.requireBase('api/v1/session');

describe('api.v1.session', function() {
  helpers.api.init();
  helpers.api.describeMethods(session, [
    {
      name: 'get',
      method: 'get',
      url: '/v1/session'
    },
    {
      name: 'update',
      method: 'put',
      url: '/v1/session'
    }
  ]);
});
