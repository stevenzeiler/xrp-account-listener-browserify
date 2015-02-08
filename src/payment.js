
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

