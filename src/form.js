/**
 * Form
 */
(function() {

var Schema = this.Schema;
var Form = Schema.Form = Schema.form = {};

/**
 * Validate and tokenize card data for payment forms
 *
 * @param  object params
 *  string publicKey (Required)
 *      - Public/publishable key for tokenization
 *  HTMLFormElement form (Optional) (Default: first form element)
 *      - Represents the form to capture data
 *  string name (Optional) (Default: 'card')
 *      - Name of the card submission parameter
 *      - Id of the payment gateway to use for tokenization
 *  function onError (Optional)
 *      - Handler for card errors triggered on submit
 */
Form.onSubmitCard = function(params) {

    Form._validateCardParams(params);

    Form._addEventListener(params.form, 'submit', Form._onSubmitCard.bind(this, params));

};

/**
 * Handle card form submission event
 */
Form._onSubmitCard = function(params, event) {

    // Card expiry is { month: 00, year: 0000 }
    var cardExpiry;
    if (params.fields.cardExp) {
        cardExpiry = Schema.cardExpiry(params.fields.cardExp.value);
    } else {
        cardExpiry = {
            month: params.fields.cardExpMonth.value,
            year: params.fields.cardExpYear.value
        };
    }

    // Assemble card info
    var data = {
        number: params.fields.cardNumber.value,
        cvc: params.fields.cardCVC.value,
        exp_month: cardExpiry.month,
        exp_year: cardExpiry.year,
        billing: {}
    };
    // Billing info is optional
    if (params.fields.billing) {
        data.billing = {
            name: params.fields.billingName && params.fields.billingName.value,
            address1: params.fields.billingAddress1 && params.fields.billingAddress1.value,
            address2: params.fields.billingAddress2 && params.fields.billingAddress2.value,
            city: params.fields.billingCity && params.fields.billingCity.value,
            state: params.fields.billingState && params.fields.billingState.value,
            zip: params.fields.billingZip && params.fields.billingZip.value,
            country: params.fields.billingCountry && params.fields.billingCountry.value
        }
    };

    // Trigger submit handler
    if (typeof params.onSubmit === 'function') {
        // Return false to prevent default
        if (params.onSubmit(data) === false) {
            return;
        }
    }

    // Card values are serialized and validated on change
    var dataSerialized = JSON.stringify(data);

    // Return if card data is not changed
    if (params.form.__cardData === dataSerialized) {
        return;
    }

    // Prevent form submission
    Form._preventDefault(event);

    // Validate card data
    var fieldsValid = true;
    if (!Schema.validateCVC(data.cvc)) {
        fieldsValid = false;
        Form._triggerFieldError(
            params.onError, params.fields.cardCVC, ''
        );
    }
    if (!Schema.validateExpiry(data.exp_month, data.exp_year)) {
        fieldsValid = false;
        if (params.fields.cardExp) {
            Form._triggerFieldError(
                params.onError, params.fields.cardExp, ''
            );
        }
        if (params.fields.cardExpMonth) {
            Form._triggerFieldError(
                params.onError, params.fields.cardExpMonth, ''
            );
        }
        if (params.fields.cardExpYear) {
            Form._triggerFieldError(
                params.onError, params.fields.cardExpYear, ''
            );
        }
    }
    if (!Schema.validateCardNumber(data.number) || !data.number) {
        fieldsValid = false;
        Form._triggerFieldError(
            params.onError, params.fields.cardNumber, ''
        );
    }
    if (!fieldsValid) {
        return;
    }

    // Card data is valid, continue to process
    params.form.__cardData = dataSerialized;

    Schema.setPublicKey(params.publicKey);
    Schema.card.createToken(data, function(status, response) {
        if (response.errors) {
            params.form.__cardData = null;
            for (var key in response.errors) {
                var field;
                switch (key) {
                    case 'exp_month': field = params.fields.cardExp || params.fields.cardExpMonth; break;
                    case 'exp_year': field = params.fields.cardExp || params.fields.cardExpYear; break;
                    case 'cvc': field = params.fields.cardCVC; break;
                    case 'number':
                    default:
                        field = params.fields.cardNumber; break;
                }
                Form._triggerFieldError(
                    params.onError, field, response.errors[key].message
                );
            }
        } else if (status > 200) {
            Form._triggerFieldError(
                params.onError, params.fields.cardNumber, 'Unknown gateway error, please try again'
            );
        } else {
            // Clear previous data fields first
            var els = document.getElementsByClassName('x-card-response-data');
            for (var i = 0; i < els.length; i++) {
                els[i].parentNode.removeChild(els[i]);
            }
            // Append card response fields to form
            var fieldName = params.name;
            for (var key in response) {
                if (typeof response[key] === 'object') {
                    continue;
                }
                var el = document.createElement('input');
                el.type = 'hidden';
                el.className = 'x-card-response-data';
                el.name = params.name + '['+key+']';
                el.value = response[key];
                params.form.appendChild(el);
            }
            params.form.submit();
        }
    });
};

/**
 * Make sure params are valid
 *
 * @return object
 */
Form._validateCardParams = function(params) {

    params || {};

    params.publicKey = params.publicKey || Schema.publicKey;
    if (!params.publicKey) {
        throw "Form.onSubmitCard(): publicKey required";
    }

    // Ensure valid form element
    if (!params.form) {
        params.form = Form._findDefaultFormElement();
    } else {
        params.form = Form._sanitizeElement(params.form);
    }
    if (params.form === null) {
        throw "Form.onSubmitCard(): form not found with .card-number field";
    }

    // Get valid card input fields
    var fields = params.fields || {};
    fields.cardNumber = Form._sanitizeElement(fields.cardNumber || '.card-number');
    if (!fields.cardNumber) {
        throw "Form.onSubmitCard(): card number field not found";
    }
    fields.cardExp = Form._sanitizeElement(fields.cardExp || '.card-exp');
    fields.cardExpMonth = Form._sanitizeElement(fields.cardExpMonth || '.card-exp-month');
    if (!fields.cardExp && !fields.cardExpMonth) {
        throw "Form.onSubmitCard(): card expiration field not found";
    }
    fields.cardExpYear = Form._sanitizeElement(fields.cardExpYear || '.card-exp-year');
    if (!fields.cardExp && !fields.cardExpYear) {
        throw "Form.onSubmitCard(): card expiration year field not found";
    }
    fields.cardCVC = Form._sanitizeElement(fields.cardCvc || fields.cardCVC || '.card-cvc');
    if (!fields.cardCVC) {
        throw "Form.onSubmitCard(): card cvc field not found";
    }
    fields.billingName = Form._sanitizeElement(fields.billingName || '.billing-name');
    fields.billingAddress1 = Form._sanitizeElement(fields.billingAddress2 || '.billing-address1');
    fields.billingAddress2 = Form._sanitizeElement(fields.billingAddress2 || '.billing-address2');
    fields.billingCity = Form._sanitizeElement(fields.billingCity || '.billing-city');
    fields.billingState = Form._sanitizeElement(fields.billingState || '.billing-state');
    fields.billingZip = Form._sanitizeElement(fields.billingZip || '.billing-zip');
    fields.billingCountry = Form._sanitizeElement(fields.billingCountry || '.billing-country');
    fields.billing = !!(
        fields.billingName ||
        fields.billingAddress1 ||
        fields.billingAddress2 ||
        fields.billingCity ||
        fields.billingState ||
        fields.billingZip ||
        fields.billingCountry
    );

    params.fields = fields;

    // Default submit parameter name
    params.name = params.name || 'card';
};

/**
 * Get a clean HTMLElement reference
 * May be passed by jQuery, ID, or class name
 *
 * @param  mixed el
 * @return HTMLElement
 */
Form._sanitizeElement = function(el) {

    if (jQuery) {
        // By jQuery reference
        return jQuery(el).get(0);
    } else if (typeof el === 'string') {
        if (el[0] === '.') {
            // By class name
            return document.getElementsByClassName(el.substring(1))[0];
        } else {
            // By ID
            return document.getElementById(el);
        }
    } else if (typeof el === 'object' && el !== null) {
        if (el.toString().indexOf('[object HTML') === 0) {
            // By direct reference
            return el;
        }
    }
    // Not valid
    return null;
}

/**
 * Find the first form element with card-number input
 *
 * @return HTMLFormElement
 */
Form._findDefaultFormElement = function() {

    var field = document.getElementsByClassName('card-number')[0];
    if (field) {
        while (true) {
            if (field = field.parentNode) {
                if (field.tagName === 'FORM') {
                    return field;
                }
            } else {
                break;
            }
        }
    }
    return null;
};

/**
 *
 */
Form._triggerFieldError = function(handler, field, message) {

    if (typeof handler === 'function') {
        return handler(field, message);
    }
    if (field && field.className.indexOf('error') === -1) {
        field.className = field.className + ' error';
    }
};

/**
 * Add a DOM event listener, cross browser
 *
 * @param  HTMLElement el
 * @param  string event
 * @param  function handler
 */
Form._addEventListener = function(el, event, handler) {

    if (el.addEventListener) {
        el.addEventListener(event, handler, false);
    } else {
        el.attachEvent('on' + event, function() {
            // set the this pointer same as addEventListener when fn is called
            return handler.call(el, window.event);   
        });
    }
};

/**
 * Prevent default event behavior, cross browser
 *
 * @param  HTMLEvent event
 */
Form._preventDefault = function(event) {

    if (event.preventDefault) { 
        event.preventDefault();
    } else {
        event.returnValue = false; 
    }
    return;
};

}).call(this);