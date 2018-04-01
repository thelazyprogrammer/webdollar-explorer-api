let assert = require('assert');

import BlockchainMiningReward from 'common/blockchain/global/Blockchain-Mining-Reward';

describe('RewardSimulator', () => {

    it('reward simulator test - general formula', ()=>{
        
        let T = 20; //Number of seconds per block
        let Y = 100; //Number of total mining years
        let TS = 42000000000; //Total Supply WEBDs
        let CP = 4; //Cycle period in years
        let N = Y / CP; //Number of cycles
        let MAX_REWARD = TS;
        let BPC = (3600 / T) * 24 * 365 * CP; //blocks per cycle
        let X; // The reward per cycle: X + X/2 + X/4 + X/8 + ... + X/2^(N-1) === TS
        
        let sum = 0.0;
        //first mining cycle mines >= half of total supply
        for (X = TS/2; X < MAX_REWARD; ++X) {
            sum = 0.0;
            for (let i = 0; i < N; ++i)
                sum += X / (1 << i);
            if (sum >= TS)
                break;
        }
        
        let SR = X / BPC;

        console.log("Blocks per cycle:", BPC);
        //console.log("Total supply:", sum);
        //console.log("Total reward per first cycle:", X);
        //console.log("Number of blocks mined per cycle:", BPC);
        //console.log("Starting reward:", SR);
        //console.log("Total supply for Y years, CP year cycle, T seconds per block, SR starting reward: ~SR*(3600/T)*24*365*4*2");
        //console.log("Simplified formula and more accurate(using 1.9999999403953552 instead of 2): 252288000 * SR / T");
        
        SR = 3000;
        let TOTALSUPPLY = 0.0;
        for (let i = 0; i < N; ++i){
            TOTALSUPPLY += (SR * BPC) / (1 << i);
        }

        //console.log("Total supply is", TOTALSUPPLY);
        
        //console.log("Total supply is", SR*(3600/T)*24*365*4*1.9999999403953552);
    });
    
    it('reward simulator test - particular formula', ()=>{

        let reward = 0;
        let smallestReward = 0.0001;
        let BPC = 6307200;
        for (let height = 0; height < BPC; height += 1024) {
            reward = BlockchainMiningReward.getReward(height);
            assert(reward === 3000, "Wrong reward for bock " + height + ": " + reward.toString() + "!==3000");
        }

        //TODO Budisteanu Shifts
        for (let cycle = 1; cycle <= 25; ++cycle) {
            let height = cycle * (BPC) - 1;
            reward = BlockchainMiningReward.getReward(height);
            let targetReward = 3000 / (1 << (cycle-1));

            if (targetReward < smallestReward) targetReward = smallestReward;
            assert(reward === targetReward, "Wrong reward for bock " + height + ": " + reward.toString() + "!==" + targetReward.toString());

            height = cycle * (BPC);
            reward = BlockchainMiningReward.getReward(height);
            targetReward = 3000 / (1 << cycle);

            if (targetReward < smallestReward) targetReward = smallestReward;
            assert(reward === targetReward, "Wrong reward for bock " + height + ": " + reward.toString() + "!==" + targetReward.toString());
        }

    });

});