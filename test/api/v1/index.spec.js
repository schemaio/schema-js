var v1 = helpers.requireBase('api/v1/index');

describe('api.v1.index', function() {
  it('exports resources', function() {
    // special
    assert.isDefined(v1.session);
    assert.isDefined(v1.account);
    assert.isDefined(v1.cart);
    assert.isDefined(v1.card);
    // standard
    assert.isDefined(v1.accounts);
    assert.isDefined(v1.blogs);
    assert.isDefined(v1.carts);
    assert.isDefined(v1.categories);
    assert.isDefined(v1.contacts);
    assert.isDefined(v1.coupons);
    assert.isDefined(v1.credits);
    assert.isDefined(v1.downloads);
    assert.isDefined(v1.invoices);
    assert.isDefined(v1.notifications);
    assert.isDefined(v1.orders);
    assert.isDefined(v1.pages);
    assert.isDefined(v1.payments);
    assert.isDefined(v1.products);
    assert.isDefined(v1.settings);
    assert.isDefined(v1.shipments);
    assert.isDefined(v1.subscriptions);
  });
});
