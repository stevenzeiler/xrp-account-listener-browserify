(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

window.XRPAccount = require('./src/xrp_account')


},{"./src/xrp_account":3}],2:[function(require,module,exports){

function Payment(transaction, account) {
  var amount, address
  if (transaction.TransactionType !== 'Payment') {
    throw new Error('not a payment')
  }

  if (transaction.Amount.currency) {
    amount = 0
  } else {
    amount = parseFloat(transaction.Amount)
  }
  if (transaction.Account === account.address) {
    // payment sent
    address = transaction.Destination 
    amount += parseFloat(transaction.Fee)
    amount *= -1
  } else {
    // payment received
    address = transaction.Account 
  }
  return {
    address: address,
    amount: amount / 1000000,
    hash: transaction.hash
  }
}

module.exports = Payment


},{}],3:[function(require,module,exports){
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


},{"./payment":2}]},{},[1]);
