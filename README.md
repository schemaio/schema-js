# Schema.js

Schema.js makes it easy to...

1. Collect credit card information without having it touch your server
2. Build product and checkout pages without compromising sensitive data

If you need help getting started, join our Slack channel at https://slack.schema.io.

### Stripe.js compatibility

If you're already using Stripe.js, Schema.js can serve as a drop-in replacement for convenience.

Make sure to replace your Stripe publishable key with your Schema public key.

### Getting Started

Add this tag to your web page.

```html
<script type="text/javascript" src="https://js.schema.io/v1"></script>
```

### Set your public key

Create an account on https://schema.io and get your public API key from `Admin > Settings > API Keys`.

Your public key provides access to public resources within your account. Unlike your private key, it starts with `pk_` and cannot be used to access sensitive data.

```javascript
Schema.setPublicKey('pk_yourkey');
```

### Collect credit card details

#### Schema.createToken

```javascript
var card = {
    number: $('.card-number').val(),
    cvc: $('.card-cvc').val(),
    exp_month: $('.card-exp-month').val(),
    exp_year: $('.card-exp-year').val()
};
Schema.createToken(card, function(status, response) {
    var $form = $('#checkout-form');

    if (response.error) {
        // Show error
        $form.find('#payment-error').text(response.error.message);
    } else {
        // Append token to the checkout form and submit
        $form.append($('<input type="hidden" name="billing[card][token]" />').val(response.token));
        $form.submit();
    }
});
```

The first argument to `createToken` must be an object with card details.

* `number`: Credit card number, with or without separators. Example: `4242 4242 4242 4242`
* `cvc`: Three or four digit number representing the card security code. Example: `321`
* `exp_month`: Integer between 1 and 12 representing the card expiration month. Example `6`
* `exp_year`: Two or four digit integer representing the card expiration year. Example `2020`

You may optionally pass card holder billing details as an object with the following properties.

* `billing`: An object containing credit card billing details.
    * `billing.name`: Name of the card holder.
    * `billing.address1`: Billing address (line 1).
    * `billing.address2`: Billing address (line 2).
    * `billing.city`: Billing city.
    * `billing.state`: Billing state.
    * `billing.zip`: Billing zip.
    * `billing.country`: Billing country.

Billing information such as `address1` and `zip` may provide card verification depending on your payment gateway, but will never cause tokenization to fail.

The second argument to `createToken` must be a callback function to handle token response.

`status` is an HTTP status code such as `200` for success, or `402` for request failure.

`response` is an object with a temporary token.

```javascript
{
    token: 't_576MiLE30xFlZWiljIUEongB'
}
```

The `token` value starting with `t_` is temporary and automatically converts to a permanent card token starting with `card_` when saved to a Schema card field such as `billing.card`.

As in the example above, you should append the token to your checkout form and assign the input name in a way that you can map to a Schema `card.token` field. When creating a Cart, Order, or updating an Account record, the complete field name is usually `billing.card.token`.

### Validate credit card details

The following methods can be used to validate card information before passing to `createToken`.

#### Schema.validateCardNumber

```javascript
Schema.validateCardNumber('4242 4242 4242 4242') // true
Schema.validateCardNumber('1111') // false
```

#### Schema.validateExpiry

```javascript
Schema.validateExpiry('03', '2021') // true
Schema.validateExpiry('04', '21')   // true
Schema.validateExpiry('05/21')      // true
Schema.validateExpiry('06-21')      // true
Schema.validateExpiry('2021/07')    // true
Schema.validateExpiry('08 2021')    // true
Schema.validateExpiry(1, 2021)      // true
Schema.validateExpiry(1, 10)        // false
```

#### Schema.validateCVC

```javascript
Schema.validateCVC('123') // true
Schema.validateCVC('xyz') // false
Schema.validateCVC('')    // false
```

#### Schema.cardType

```javascript
Schema.cardType('4242 4242 4242 4242') // "Visa"
Schema.cardType('378282246310005')     // "American Express"
Schema.cardType('1111')                // "Unknown"
```

#### Schema.cardExpiry

```javascript
Schema.cardExpiry('01/2021') // {month: 1, year: 2021}
Schema.cardExpiry('01-21')   // {month: 1, year: 2021}
Schema.cardExpiry('01 21')   // {month: 1, year: 2021}
```

## Need help?

Visit https://schema.io and join our Slack channel at https://slack.schema.io.
