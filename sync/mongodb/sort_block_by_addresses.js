[
  {
    $match: {
      fee: {
        $eq: 0
      }
    }
  }, {
    $project: {
      number: 1,
      miner: 1,
      fee: 1,
      addresses_count: {
        $size: '$addresses'
      }
    }
  }, {
    $sort: {
      'addresses_count': -1
    }
  }, {
    $limit: 50
  }
]
