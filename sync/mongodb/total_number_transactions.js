[
  {
    $group: {
      _id: 1,
      total_transactions: {
        $sum: '$trxs_number'
      }
    }
  }
]
