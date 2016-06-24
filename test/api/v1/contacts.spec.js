var contacts = helpers.requireBase('api/v1/contacts');

describe('api.v1.contacts', function() {
  helpers.api.init();
  helpers.api.describeMethods(contacts, [
    {
      name: 'subscribe',
      method: 'post',
      url: '/v1/contacts/subscribe',
      args: [ 'email', 'email_optin_lists' ]
    },
    {
      name: 'unsubscribe',
      method: 'post',
      url: '/v1/contacts/unsubscribe',
      args: [ 'email', 'email_optin_lists' ]
    }
  ]);
});
