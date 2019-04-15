[
  {
    $group: {
      _id: 0,
      test: {
        $addToSet: '$miner'
      }
    }
  }, {
    $project: {
      _id: 0,
      test: {
        $size: '$test'
      }
    }
  }
]
