[
  {
    $group: {
      _id: 0,
      addresses: {
        $addToSet: '$addresses'
      }
    }
  }, {
    $unwind: {
      path: '$addresses',
      preserveNullAndEmptyArrays: false
    }
  }, {
    $unwind: {
      path: '$addresses',
      preserveNullAndEmptyArrays: false
    }
  }, {
    $group: {
      _id: 0,
      addresses: {
        $addToSet: '$addresses'
      }
    }
  }, {
    $project: {
      _id: 0,
      addresses_count: {
        $size: '$addresses'
      }
    }
  }
]
