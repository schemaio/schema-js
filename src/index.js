/**
 * Client library, card tokenizer, and drop-in replacement for Stripe.js
 */
(function() {

var Schema = this.Schema = {
    publicUrl: 'https://api.schema.io',
    vaultUrl: 'https://vault.schema.io',
    publicKey: null
};

/**
 * Set public key used to identify client in API calls
 *
 * @param  string key
 */
Schema.setPublicKey = function(key) {
    this.publicKey = key;
    delete this._vaultClient;
    delete this._publicClient;
};

/**
 * Alias for stripe.js compatibility
 *
 * @param  string key
 */
Schema.setPublishableKey = function(key) {
    return Schema.setPublicKey(key);
};

/**
 * Alias card namespace
 */
Schema.card = {};

/**
 * Create a token from card details
 *
 * @param  object card
 * @param  function callback
 * @return void
 */
Schema.createToken = function(card, callback) {

    var error = null;
    var param = null
    if (!card) {
        error = 'Card details are missing in `Schema.createToken(card, callback)`';
        param = '';
    }
    if (!callback) {
        error = 'Callback function missing in `Schema.createToken(card, callback)`';
        param = '';
    }
    if (!Schema.card.validateCardNumber(card.number)) {
        error = 'Card number appears to be invalid';
        param = 'number';
    }
    if (card.exp) {
        var exp = Schema.cardExpiry(card.exp);
        card.exp_month = exp.month;
        card.exp_year = exp.year;
    }
    if (!Schema.card.validateExpiry(card.exp_month, card.exp_year)) {
        error = 'Card expiry appears to be invalid';
        param = 'exp_month';
    }
    if (!Schema.card.validateCVC(card.cvc)) {
        error = 'Card CVC code appears to be invalid';
        param = 'exp_cvc';
    }
    if (error) {
        setTimeout(function() {
            callback(402, {error: {message: error, param: param}});
        }, 1);
        return;
    }

    if (!card.billing) {
        card.billing = {};
    }
    if (card.address_line1) {
        card.billing.address1 = card.address_line1;
    }
    if (card.address_line2) {
        card.billing.address2 = card.address_line2;
    }
    if (card.address_city) {
        card.billing.city = card.address_city;
    }
    if (card.address_state) {
        card.billing.state = card.address_state;
    }
    if (card.address_zip) {
        card.billing.zip = card.address_zip;
    }
    if (card.address_country) {
        card.billing.country = card.address_country;
    }

    // Get a token from Schema Vault
    Schema.vault().post('/tokens', card, function(result, headers) {
        var response = result || {};
        if (headers.$error) {
            response.error = {message: headers.$error};
        } else if (response.errors) {
            var param = Object.keys(result.errors)[0];
            response.error = result.errors[param];
            response.error.param = param;
            headers.$status = 402;
        } else if (result.toObject) {
            response = result.toObject();
        }
        return callback(headers.$status, response);
    });
};
Schema.card.createToken = function() {
    return Schema.createToken.apply(this, arguments);
};

/**
 * Parse card expiry from a string value
 *
 * @param  string value
 * @return object {month: int, year: int}
 */
Schema.cardExpiry = function(value) {

    if (value && value.month && value.year) {
        return value;
    }

    var parts = new String(value).split(/[\s\/\-]+/, 2);
    var month = parts[0];
    var year = parts[1];

    // Convert 2 digit year
    if (year && year.length === 2 && /^\d+$/.test(year)) {
        var prefix = (new Date).getFullYear().toString().substring(0, 2);
        year = prefix + year;
    }

    return {
        month: ~~month,
        year: ~~year
    };
};

/**
 * Determine card type
 */
Schema.cardType = function() {
    return Schema.Stripe.card.cardType.apply(Schema.Stripe, arguments);
};
Schema.card.cardType = function() {
    return Schema.cardType.apply(this, arguments);
};

/**
 * Validate card number
 */
Schema.validateCardNumber = function() {
    return Schema.Stripe.card.validateCardNumber.apply(Schema.Stripe, arguments);
};
Schema.card.validateCardNumber = function() {
    return Schema.validateCardNumber.apply(this, arguments);
};

/**
 * Validate card expiry
 */
Schema.validateExpiry = function() {
    return Schema.Stripe.card.validateExpiry.apply(Schema.Stripe, arguments);
};
Schema.card.validateExpiry = function() {
    return Schema.validateExpiry.apply(this, arguments);
};

/**
 * Validate card CVC code
 */
Schema.validateCVC = function() {
    return Schema.Stripe.card.validateCVC.apply(Schema.Stripe, arguments);
};
Schema.card.validateCVC = function() {
    return Schema.validateCVC.apply(this, arguments);
};

/**
 * Get a public client instance if public key is defined
 *
 * @return Schema.Client
 */
Schema.client = function() {

    if (this._publicClient) {
        return this._publicClient;
    }
    if (!this.publicKey) {
        throw "Error: Public key must be set Schema.setPublicKey()";
    }

    this._publicClient = new Schema.Client(this.publicKey, {hostUrl: this.publicUrl});

    return this._publicClient;
};

/**
 * Get a vault client instance if public key is defined
 *
 * @return Schema.Client
 */
Schema.vault = function() {

    if (this._vaultClient) {
        return this._vaultClient;
    }
    if (!this.publicKey) {
        throw "Error: Public key must be set Schema.setPublicKey()";
    }

    this._vaultClient = new Schema.Client(this.publicKey, {hostUrl: this.vaultUrl});

    return this._vaultClient;
};


/**
 * Include Stripe (v2)
 * Use for validation and Stripe specific tokenization
 */
(function() {
    var e, t, n, r, i, s = {}.hasOwnProperty,
        o = function(e, t) {
            function r() {
                this.constructor = e
            }
            for (var n in t) s.call(t, n) && (e[n] = t[n]);
            return r.prototype = t.prototype, e.prototype = new r, e.__super__ = t.prototype, e
        },
        u = this;
    this.Stripe = function() {
        function e() {}
        return e.version = 2, e.endpoint = "https://api.stripe.com/v1", e.setPublishableKey = function(t) {
            e.key = t
        }, e.complete = function(t, n) {
            return function(r, i, s) {
                var o;
                if (r !== "success") return o = Math.round((new Date)
                        .getTime() / 1e3), (new Image)
                    .src = "https://q.stripe.com?event=stripejs-error&type=" + r + "&key=" + e.key + "&timestamp=" + o, typeof t == "function" ? t(500, {
                        error: {
                            code: r,
                            type: r,
                            message: n
                        }
                    }) : void 0
            }
        }, e
    }.call(this), e = this.Stripe, this.Stripe.token = function() {
        function t() {}
        return t.validate = function(e, t) {
            if (!e) throw t + " required";
            if (typeof e != "object") throw t + " invalid"
        }, t.formatData = function(t, n) {
            return e.utils.isElement(t) && (t = e.utils.paramsFromForm(t, n)), e.utils.underscoreKeys(t), t
        }, t.create = function(t, n) {
            return t.key || (t.key = e.key || e.publishableKey), e.utils.validateKey(t.key), e.ajaxJSONP({
                url: "" + e.endpoint + "/tokens",
                data: t,
                method: "POST",
                success: function(e, t) {
                    return typeof n == "function" ? n(t, e) : void 0
                },
                complete: e.complete(n, "A network error has occurred, and you have not been charged. Please try again."),
                timeout: 4e4
            })
        }, t.get = function(t, n) {
            if (!t) throw "token required";
            return e.utils.validateKey(e.key), e.ajaxJSONP({
                url: "" + e.endpoint + "/tokens/" + t,
                data: {
                    key: e.key
                },
                success: function(e, t) {
                    return typeof n == "function" ? n(t, e) : void 0
                },
                complete: e.complete(n, "A network error has occurred loading data from Stripe. Please try again."),
                timeout: 4e4
            })
        }, t
    }.call(this), this.Stripe.card = function(t) {
        function n() {
            return n.__super__.constructor.apply(this, arguments)
        }
        return o(n, t), n.tokenName = "card", n.whitelistedAttrs = ["number", "cvc", "exp_month", "exp_year", "name", "address_line1", "address_line2", "address_city", "address_state", "address_zip", "address_country"], n.createToken = function(t, r, i) {
            var s;
            return r == null && (r = {}), e.token.validate(t, "card"), typeof r == "function" ? (i = r, r = {}) : typeof r != "object" && (s = parseInt(r, 10), r = {}, s > 0 && (r.amount = s)), r[n.tokenName] = e.token.formatData(t, n.whitelistedAttrs), e.token.create(r, i)
        }, n.getToken = function(t, n) {
            return e.token.get(t, n)
        }, n.validateCardNumber = function(e) {
            return e = (e + "")
                .replace(/\s+|-/g, ""), e.length >= 10 && e.length <= 16 && n.luhnCheck(e)
        }, n.validateCVC = function(t) {
            return t = e.utils.trim(t), /^\d+$/.test(t) && t.length >= 3 && t.length <= 4
        }, n.validateExpiry = function(t, n) {
            var r, i;
            return t = e.utils.trim(t), n = e.utils.trim(n), /^\d+$/.test(t) ? /^\d+$/.test(n) ? parseInt(t, 10) <= 12 ? (i = new Date(n, t), r = new Date, i.setMonth(i.getMonth() - 1), i.setMonth(i.getMonth() + 1, 1), i > r) : !1 : !1 : !1
        }, n.luhnCheck = function(e) {
            var t, n, r, i, s, o;
            r = !0, i = 0, n = (e + "")
                .split("")
                .reverse();
            for (s = 0, o = n.length; s < o; s++) {
                t = n[s], t = parseInt(t, 10);
                if (r = !r) t *= 2;
                t > 9 && (t -= 9), i += t
            }
            return i % 10 === 0
        }, n.cardType = function(e) {
            return n.cardTypes[e.slice(0, 2)] || "Unknown"
        }, n.cardTypes = function() {
            var e, t, n, r;
            t = {};
            for (e = n = 40; n <= 49; e = ++n) t[e] = "Visa";
            for (e = r = 50; r <= 59; e = ++r) t[e] = "MasterCard";
            return t[34] = t[37] = "American Express", t[60] = t[62] = t[64] = t[65] = "Discover", t[35] = "JCB", t[30] = t[36] = t[38] = t[39] = "Diners Club", t
        }(), n
    }.call(this, this.Stripe.token), this.Stripe.bankAccount = function(t) {
        function n() {
            return n.__super__.constructor.apply(this, arguments)
        }
        return o(n, t), n.tokenName = "bank_account", n.whitelistedAttrs = ["country", "routing_number", "account_number"], n.createToken = function(t, r, i) {
            return r == null && (r = {}), e.token.validate(t, "bank account"), typeof r == "function" && (i = r, r = {}), r[n.tokenName] = e.token.formatData(t, n.whitelistedAttrs), e.token.create(r, i)
        }, n.getToken = function(t, n) {
            return e.token.get(t, n)
        }, n.validateRoutingNumber = function(t, r) {
            t = e.utils.trim(t);
            switch (r) {
                case "US":
                    return /^\d+$/.test(t) && t.length === 9 && n.routingChecksum(t);
                case "CA":
                    return /\d{5}\-\d{3}/.test(t) && t.length === 9;
                default:
                    return !0
            }
        }, n.validateAccountNumber = function(t, n) {
            t = e.utils.trim(t);
            switch (n) {
                case "US":
                    return /^\d+$/.test(t) && t.length >= 1 && t.length <= 17;
                default:
                    return !0
            }
        }, n.routingChecksum = function(e) {
            var t, n, r, i, s, o;
            r = 0, t = (e + "")
                .split(""), o = [0, 3, 6];
            for (i = 0, s = o.length; i < s; i++) n = o[i], r += parseInt(t[n]) * 3, r += parseInt(t[n + 1]) * 7, r += parseInt(t[n + 2]);
            return r !== 0 && r % 10 === 0
        }, n
    }.call(this, this.Stripe.token), this.Stripe.bitcoinReceiver = function() {
        function t() {}
        return t._whitelistedAttrs = ["amount", "currency", "email", "description"], t.createReceiver = function(t, n) {
            var r;
            return e.token.validate(t, "bitcoin_receiver data"), r = e.token.formatData(t, this._whitelistedAttrs), r.key = e.key || e.publishableKey, e.utils.validateKey(r.key), e.ajaxJSONP({
                url: "" + e.endpoint + "/bitcoin/receivers",
                data: r,
                method: "POST",
                success: function(e, t) {
                    return typeof n == "function" ? n(t, e) : void 0
                },
                complete: e.complete(n, "A network error has occurred while creating a Bitcoin address. Please try again."),
                timeout: 4e4
            })
        }, t.getReceiver = function(t, n) {
            var r;
            if (!t) throw "receiver id required";
            return r = e.key || e.publishableKey, e.utils.validateKey(r), e.ajaxJSONP({
                url: "" + e.endpoint + "/bitcoin/receivers/" + t,
                data: {
                    key: r
                },
                success: function(e, t) {
                    return typeof n == "function" ? n(t, e) : void 0
                },
                complete: e.complete(n, "A network error has occurred loading data from Stripe. Please try again."),
                timeout: 4e4
            })
        }, t._activeReceiverPolls = {}, t._clearReceiverPoll = function(e) {
            return delete t._activeReceiverPolls[e]
        }, t._pollInterval = 1500, t.pollReceiver = function(e, t) {
            if (this._activeReceiverPolls[e] != null) throw "You are already polling receiver " + e + ". Please cancel that poll before polling it again.";
            return this._activeReceiverPolls[e] = {}, this._pollReceiver(e, t)
        }, t._pollReceiver = function(e, n) {
            t.getReceiver(e, function(r, i) {
                var s, o;
                if (t._activeReceiverPolls[e] == null) return;
                return r === 200 && i.filled ? (t._clearReceiverPoll(e), typeof n == "function" ? n(r, i) : void 0) : r >= 400 && r < 500 ? (t._clearReceiverPoll(e), typeof n == "function" ? n(r, i) : void 0) : (s = r === 500 ? 5e3 : t._pollInterval, o = setTimeout(function() {
                    return t._pollReceiver(e, n)
                }, s), t._activeReceiverPolls[e].timeoutId = o)
            })
        }, t.cancelReceiverPoll = function(e) {
            var n;
            n = t._activeReceiverPolls[e];
            if (n == null) throw "You are not polling receiver " + e + ".";
            n["timeoutId"] != null && clearTimeout(n.timeoutId), t._clearReceiverPoll(e)
        }, t
    }.call(this), t = ["createToken", "getToken", "cardType", "validateExpiry", "validateCVC", "validateCardNumber"];
    for (r = 0, i = t.length; r < i; r++) n = t[r], this.Stripe[n] = this.Stripe.card[n];
    typeof module != "undefined" && module !== null && (module.exports = this.Stripe), typeof define == "function" && define("stripe", [], function() {
        return u.Stripe
    })
})
.call(this),
    function() {
        var e, t, n, r = [].slice;
        e = encodeURIComponent, t = (new Date)
            .getTime(), n = function(t, r, i) {
                var s, o;
                r == null && (r = []);
                for (s in t) o = t[s], i && (s = "" + i + "[" + s + "]"), typeof o == "object" ? n(o, r, s) : r.push("" + s + "=" + e(o));
                return r.join("&")
                    .replace(/%20/g, "+")
            }, this.Stripe.ajaxJSONP = function(e) {
                var i, s, o, u, a, f;
                return e == null && (e = {}), o = "sjsonp" + ++t, a = document.createElement("script"), s = null, i = function(t) {
                    var n;
                    return t == null && (t = "abort"), clearTimeout(s), (n = a.parentNode) != null && n.removeChild(a), o in window && (window[o] = function() {}), typeof e.complete == "function" ? e.complete(t, f, e) : void 0
                }, f = {
                    abort: i
                }, a.onerror = function() {
                    return f.abort(), typeof e.error == "function" ? e.error(f, e) : void 0
                }, window[o] = function() {
                    var t;
                    t = 1 <= arguments.length ? r.call(arguments, 0) : [], clearTimeout(s), a.parentNode.removeChild(a);
                    try {
                        delete window[o]
                    } catch (n) {
                        window[o] = void 0
                    }
                    return typeof e.success == "function" && e.success.apply(e, t), typeof e.complete == "function" ? e.complete("success", f, e) : void 0
                }, e.data || (e.data = {}), e.data.callback = o, e.method && (e.data._method = e.method), a.src = e.url + "?" + n(e.data), u = document.getElementsByTagName("head")[0], u.appendChild(a), e.timeout > 0 && (s = setTimeout(function() {
                    return f.abort("timeout")
                }, e.timeout)), f
            }
    }.call(this),
    function() {
        var e = [].indexOf || function(e) {
            for (var t = 0, n = this.length; t < n; t++)
                if (t in this && this[t] === e) return t;
            return -1
        };
        this.Stripe.utils = function() {
            function t() {}
            return t.trim = function(e) {
                return (e + "")
                    .replace(/^\s+|\s+$/g, "")
            }, t.underscore = function(e) {
                return (e + "")
                    .replace(/([A-Z])/g, function(e) {
                        return "_" + e.toLowerCase()
                    })
                    .replace(/-/g, "_")
            }, t.underscoreKeys = function(e) {
                var t, n, r;
                r = [];
                for (t in e) n = e[t], delete e[t], r.push(e[this.underscore(t)] = n);
                return r
            }, t.isElement = function(e) {
                return typeof e != "object" ? !1 : typeof jQuery != "undefined" && jQuery !== null && e instanceof jQuery ? !0 : e.nodeType === 1
            }, t.paramsFromForm = function(t, n) {
                var r, i, s, o, u, a, f, l, c, h;
                n == null && (n = []), typeof jQuery != "undefined" && jQuery !== null && t instanceof jQuery && (t = t[0]), s = t.getElementsByTagName("input"), u = t.getElementsByTagName("select"), a = {};
                for (f = 0, c = s.length; f < c; f++) {
                    i = s[f], r = this.underscore(i.getAttribute("data-stripe"));
                    if (e.call(n, r) < 0) continue;
                    a[r] = i.value
                }
                for (l = 0, h = u.length; l < h; l++) {
                    o = u[l], r = this.underscore(o.getAttribute("data-stripe"));
                    if (e.call(n, r) < 0) continue;
                    o.selectedIndex != null && (a[r] = o.options[o.selectedIndex].value)
                }
                return a
            }, t.validateKey = function(e) {
                if (!e || typeof e != "string") throw new Error("You did not set a valid publishable key. Call Stripe.setPublishableKey() with your publishable key. For more info, see https://stripe.com/docs/stripe.js");
                if (/\s/g.test(e)) throw new Error("Your key is invalid, as it contains whitespace. For more info, see https://stripe.com/docs/stripe.js");
                if (/^sk_/.test(e)) throw new Error("You are using a secret key with Stripe.js, instead of the publishable one. For more info, see https://stripe.com/docs/stripe.js")
            }, t
        }()
    }.call(this),
    function() {
        var e = [].indexOf || function(e) {
            for (var t = 0, n = this.length; t < n; t++)
                if (t in this && this[t] === e) return t;
            return -1
        };
        this.Stripe.validator = {
            "boolean": function(e, t) {
                if (t !== "true" && t !== "false") return "Enter a boolean string (true or false)"
            },
            integer: function(e, t) {
                if (!/^\d+$/.test(t)) return "Enter an integer"
            },
            positive: function(e, t) {
                if (!(!this.integer(e, t) && parseInt(t, 10) > 0)) return "Enter a positive value"
            },
            range: function(t, n) {
                var r;
                if (r = parseInt(n, 10), e.call(t, r) < 0) return "Needs to be between " + t[0] + " and " + t[t.length - 1]
            },
            required: function(e, t) {
                if (e && (t == null || t === "")) return "Required"
            },
            year: function(e, t) {
                if (!/^\d{4}$/.test(t)) return "Enter a 4-digit year"
            },
            birthYear: function(e, t) {
                var n;
                n = this.year(e, t);
                if (n) return n;
                if (parseInt(t, 10) > 2e3) return "You must be over 18";
                if (parseInt(t, 10) < 1900) return "Enter your birth year"
            },
            month: function(e, t) {
                if (this.integer(e, t)) return "Please enter a month";
                if (this.range([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], t)) return "Needs to be between 1 and 12"
            },
            choices: function(t, n) {
                if (e.call(t, n) < 0) return "Not an acceptable value for this field"
            },
            email: function(e, t) {
                if (!/^[^@<\s>]+@[^@<\s>]+$/.test(t)) return "That doesn't look like an email address"
            },
            url: function(e, t) {
                if (!/^https?:\/\/.+\..+/.test(t)) return "Not a valid url"
            },
            usTaxID: function(e, t) {
                if (!/^\d{2}-?\d{1}-?\d{2}-?\d{4}$/.test(t)) return "Not a valid tax ID"
            },
            ein: function(e, t) {
                if (!/^\d{2}-?\d{7}$/.test(t)) return "Not a valid EIN"
            },
            ssnLast4: function(e, t) {
                if (!/^\d{4}$/.test(t)) return "Not a valid last 4 digits for an SSN"
            },
            ownerPersonalID: function(e, t) {
                var n;
                n = function() {
                    switch (e) {
                        case "CA":
                            return /^\d{3}-?\d{3}-?\d{3}$/.test(t);
                        case "US":
                            return !0
                    }
                }();
                if (!n) return "Not a valid ID"
            },
            bizTaxID: function(e, t) {
                var n, r, i, s, o, u, a, f;
                u = {
                    CA: ["Tax ID", [/^\d{9}$/]],
                    US: ["EIN", [/^\d{2}-?\d{7}$/]]
                }, o = u[e];
                if (o != null) {
                    n = o[0], s = o[1], r = !1;
                    for (a = 0, f = s.length; a < f; a++) {
                        i = s[a];
                        if (i.test(t)) {
                            r = !0;
                            break
                        }
                    }
                    if (!r) return "Not a valid " + n
                }
            },
            zip: function(e, t) {
                var n;
                n = function() {
                    switch (e.toUpperCase()) {
                        case "CA":
                            return /^[\d\w]{6}$/.test(t != null ? t.replace(/\s+/g, "") : void 0);
                        case "US":
                            return /^\d{5}$/.test(t) || /^\d{9}$/.test(t)
                    }
                }();
                if (!n) return "Not a valid zip"
            },
            bankAccountNumber: function(e, t) {
                if (!/^\d{1,17}$/.test(t)) return "Invalid bank account number"
            },
            usRoutingNumber: function(e) {
                var t, n, r, i, s, o, u;
                if (!/^\d{9}$/.test(e)) return "Routing number must have 9 digits";
                s = 0;
                for (t = o = 0, u = e.length - 1; o <= u; t = o += 3) n = parseInt(e.charAt(t), 10) * 3, r = parseInt(e.charAt(t + 1), 10) * 7, i = parseInt(e.charAt(t + 2), 10), s += n + r + i;
                if (s === 0 || s % 10 !== 0) return "Invalid routing number"
            },
            caRoutingNumber: function(e) {
                if (!/^\d{5}\-\d{3}$/.test(e)) return "Invalid transit number"
            },
            routingNumber: function(e, t) {
                switch (e.toUpperCase()) {
                    case "CA":
                        return this.caRoutingNumber(t);
                    case "US":
                        return this.usRoutingNumber(t)
                }
            },
            phoneNumber: function(e, t) {
                var n;
                n = t.replace(/[^0-9]/g, "");
                if (n.length !== 10) return "Invalid phone number"
            },
            bizDBA: function(e, t) {
                if (!/^.{1,23}$/.test(t)) return "Statement descriptors can only have up to 23 characters"
            },
            nameLength: function(e, t) {
                if (t.length === 1) return "Names need to be longer than one character"
            }
        }
    }.call(this);

// Alias Stripe for node compatibility
this.Schema.Stripe = this.Stripe;

/**
 * Aliases for compatibility between Stripe v1 and v2
 */
this.Stripe.createToken = function() {
    return this.card.createToken.apply(arguments);
};
this.Stripe.cardType = function() {
    return this.card.cardType.apply(arguments);
};
this.Stripe.validateCardNumber = function() {
    return this.card.validateCardNumber.apply(arguments);
};
this.Stripe.validateExpiry = function() {
    return this.card.validateExpiry.apply(arguments);
};
this.Stripe.validateCVC = function() {
    return this.card.validateCVC.apply(arguments);
};

// Exports
if (typeof module !== 'undefined') {
    module.exports = this.Schema;
}

}).call(this);

