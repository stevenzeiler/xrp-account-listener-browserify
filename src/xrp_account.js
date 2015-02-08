var Payment = require('./payment')

function XRPAccount(options) {
  this.address   = options.address
  this.onPayment = options.onPayment
}

XRPAccount.prototype.subscribe = function() {
  this.disconnect = false
  var _this = this

  this.webSocket = new WebSocket('wss://s1.ripple.com')

  this.webSocket.error = function(code, message) {
    console.log('websocket error', code, message)
    throw new Error(message)
  }
  this.webSocket.onopen = function() {
    _this.webSocket.send(JSON.stringify({
      "command": "subscribe",
      "accounts": [_this.address]
    }))
  }
  this.webSocket.onmessage = function(event) {
    try {
      var message = JSON.parse(event.data)
      var transaction = message.transaction
      if (transaction) {
        _this.onTransaction(transaction)
      }
    } catch(exception) {
      console.log('error', exception)
    }
  }
  this.webSocket.onclose = function() {
    console.log('websocket closed')
    if (!_this.disconnect) {
      console.log('reconnecting')
      _this.subscribe()
    }
  }
}

XRPAccount.prototype.onTransaction = function(transaction) {
  if (transaction.TransactionType === 'Payment') {
    if (typeof this.onPayment === 'function') {
      this.onPayment(new Payment(transaction, this))
    }
  }
}

XRPAccount.prototype.unsubscribe = function() {
  this.disconnect = true
  this.webSocket.close()
}

module.exports = XRPAccount

