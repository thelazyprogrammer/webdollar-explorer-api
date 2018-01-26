import MiniBlockchainAddress from 'common/blockchain/mini-blockchain/Mini-Blockchain-Address'
import InterfaceSatoshminDB from 'common/satoshmindb/Interface-SatoshminDB'
import WebDollarCryptoData from 'common/crypto/WebDollar-Crypto-Data'
import Serialization from "common/utils/Serialization";
import BufferExtended from "common/utils/BufferExtended";
const colors = require('colors/safe');

const md5 = require('md5');
const EventEmitter = require('events');
const FileSystem = require('fs');

class MainBlockchainWallet{

    constructor(blockchain, password = 'password', db){

        this.blockchain = blockchain;
        this.walletFileName = 'wallet.bin';
        
        if(db === undefined)
            this.db = new InterfaceSatoshminDB();
        else
            this.db = db;


        this.addresses = [];
        
        this.password = password;

        this.emitter = new EventEmitter();

    }

    async _justCreateNewAddress(salt, emptyAddress){

        let blockchainAddress = new MiniBlockchainAddress(this.db, this.password);

        if (!emptyAddress)
            await blockchainAddress.createNewAddress(salt);

        //console.log("_justCreateNewAddress", blockchainAddress);

        return blockchainAddress;

    }

    async createNewAddress(salt){

        let blockchainAddress = await this._justCreateNewAddress(salt, false);

        this.addresses.push(blockchainAddress);

        this.emitter.emit('wallet/address-changes', blockchainAddress.address );

        await this.saveAddresses();

        return blockchainAddress;
    }

    async createNewAddressPrivateKey(salt){

        let blockchainAddress = await this._justCreateNewAddress(salt, false);

        this.addresses.push(blockchainAddress);

        this.emitter.emit('wallet/address-changes', blockchainAddress );

        await this.saveAddresses();

        return blockchainAddress;
    }
    
    async updatePassword(newPassword){

        for (let i = 0; i < this.addresses.length; ++i) {
            let privateKey = await this.addresses[i].getPrivateKey(this.password);
            await this.addresses[i].savePrivateKey(privateKey, newPassword);

            this.addresses[i].updatePassword(newPassword);
        }

        this.password = newPassword;

        this.emitter.emit('wallet/password-changed', {});
    }
    
    async serialize(serializePrivateKey = false) {

        let list = [Serialization.serializeNumber4Bytes(this.addresses.length)];

        for (let i = 0; i < this.addresses.length; ++i) {
            let walletBuffer = await this.addresses[i].serializeAddress(serializePrivateKey);
            list.push(walletBuffer);
        }

        return Buffer.concat (list);
    }
    
    async deserialize(buffer, deserializePrivateKey = false) {

        let data = WebDollarCryptoData.createWebDollarCryptoData(buffer).buffer;
        let offset = 0;

        try {

            let numAddresses = Serialization.deserializeNumber( BufferExtended.substr(data, offset, 4) );
            offset += 4;
            
            this.addresses = [];
            for (let i = 0; i < numAddresses; ++i) {
                this.addresses[i] = await this._justCreateNewAddress(undefined, true);
                offset += await this.addresses[i].deserializeAddress( BufferExtended.substr(buffer, offset), deserializePrivateKey );

            }

            return true;

        } catch (exception){
            console.log("Error deserializing a Wallet. ", exception);
            throw exception;
        }
    }
    
    async saveAddresses() {

        let value = await this.serialize();

        return (await this.db.save(this.walletFileName, value));
    }
    
    async loadAddresses() {

        let buffer = await this.db.get(this.walletFileName);

        if ( buffer === null || buffer === undefined)
            return false;

        try {
            await this.deserialize(buffer);
        } catch (exception){
            alert('Wallet was not imported successfully');
            this.addresses = [];
        }

        await this.updatePassword(this.password);

        if (this.addresses.length > 0)
            this.emitter.emit('wallet/changes', this.addresses );

        return true;


    }
    
    async removeAddresses() {

        this.addresses = [];
        let answer = await this.db.remove(this.walletFileName);

        this.emitter.emit('wallet/changes', this.addresses);

        return answer;
    }

    getAddressPic(address){

        if (Buffer.isBuffer(address))
            address = BufferExtended.toBase();

        return `https://www.gravatar.com/avatar/${md5(address)}?d=retro&f=y`;

    }

    async getMiningAddress(){

        if (this.addresses.length === 0)
            await this.createNewAddress();

        return this.addresses[0].address;

    }

    export(filePath){

        return new Promise(resolve => {

            FileSystem.open(filePath, 'w', async (err, fd) => {

                if (err){
                    resolve(false);
                    return;
                }

                let walletBuffer = await this.serialize(true);

                FileSystem.write(fd, walletBuffer, 0, walletBuffer.length, null, function (err) {

                    if (err){
                        resolve(false);
                        return;
                    }

                    FileSystem.close(fd, function () {
                        resolve(true);
                    });
                });
            });
        });

    }

    import(filePath){

        return new Promise(resolve => {

            let readStream = FileSystem.createReadStream(filePath);

            readStream.on('data', async (buffer) => {

                resolve(await this.deserialize(buffer, true));
            });

        });
    }

}

export default MainBlockchainWallet