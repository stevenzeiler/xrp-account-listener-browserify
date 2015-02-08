# XRP Account Listener Browserify

Subscribe to changes to XRP balances of a Ripple account

## Usage

````
var XRPAccount = require('xrp-account-listener-browserify')

new XRPAccount({
  address  : 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
  onPayment: function(payment) {
    console.log('PAYMENT', payment)
    this.unsubscribe()
  }
})
.subscribe()
````

