[
  {
    $match: {
      miner: 'WEBD$gDSRHzxo4hSnsxDxZ3q5maccGLgyMeH9fz$'
    }
  }, {
    $group: {
      _id: 1,
      total_reward: {
        $sum: "$base_reward"
      }
    }
  }
]
