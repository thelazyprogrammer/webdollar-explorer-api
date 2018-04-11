import consts from 'consts/const_global'
import BufferExtended from "common/utils/BufferExtended";

class PPoWHelper{

    /**
     * LCA between too proofs. Each proof contains a blocks array
     * @param proofs1
     * @param proofs2
     * @returns {*}
     * @constructor
     */
    LCA(proofs1, proofs2){

        //LCA(C1, C2) = (C1 ∩ C2)[−1] π

        let i1 = proofs1.length - 1;
        let i2 = proofs2.length - 1;

        //Find LCA on path to Genesis
        while (i1 >= 0 && i2 >= 0) {
            const block1 = proofs1.blocks[i1];
            const block2 = proofs2.blocks[i2];

            if (BufferExtended.safeCompare(block1, block2))
                return block1;
            else if (block1.height > block2.height)
                i1--;
            else
                i2--;
        }

        return null;
    }



    /**
     * Definition 5 (Locally good superchain).
     * @param superLength
     * @param underlyingLength
     * @param miu
     * @returns {boolean}
     * @private
     */
    _localGood(superLength, underlyingLength, miu){

        //local-goodδ (C', C, µ), if |C0| > (1 − δ) 2^−µ * |C|.

        //using big Number
        if ( new BigInteger(superLength).greater( (new BigInteger(1).minus(consts.POPOW_PARAMS.d)).multiply( new BigInteger(2).pow( - miu ) * underlyingLength ) ))
            return true;
        else
            return false;
    }

    /**
     * Definition 6 (Superchain quality).
     * @param superchain
     * @param miu
     * @param m
     * @returns {boolean}
     * @private
     */
    _superchainQuality(superchain, miu, m){

        if (m < 1)
            throw ('superchainQuality is not good');

        if (superchain.length < m)
            return false;

        //m ∈ N states that for all m' ≥ m

        // local-good δ (C↑ µ [−m' :], C↑µ [−m' :]↓ , µ).

        while ( m < superchain.length ){

            // TODO !!!!!! maybe it will require an min

            const underlyingLength = superchain.blocks.last.height - superchain.blocks[superchain.length - m].height + 1; // I think it is without +1

            // C'length = m
            // C.length = underlingLength

            if (this._localGood( Math.min( m, superchain.length ), underlyingLength , miu) === false)
                return false;

            m++;
        }

        return true;
    }

    /**
     * Definition 7 (Multilevel quality)
     * @param superchain
     * @param miu
     * @returns {boolean}
     * @private
     */
    _multilevelQuality(superchain, miu){

        //C ∗ = C [−m : ]

        return true;
        // TBD
    }

    /**
     * Definition 8 (Good superchain)
     * if it has both superquality and multilevel quality with parameters (δ, m)
     * @param superchain
     * @param miu
     * @returns {boolean}
     */
    good(superchain, miu){

        if (this._superchainQuality(superchain, miu) === false)
            return false;


        if (this._multilevelQuality(superchain, miu) === false)
            return false;

        return true;
    }

}

export default new PPoWHelper();