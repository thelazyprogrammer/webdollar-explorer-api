# Deploy a WebDollar Blockchain Explorer API

### 1. Install Ubuntu 16.04
### 2. sudo apt update && sudo apt upgrade
### 3. Install the following:
```shell
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y build-essential linuxbrew-wrapper erlang libssl-dev:i386
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.profile
nvm install 8.2.1
nvm use 8.2.1
```
### 4 Clone Node-WebDollar
```shell
git clone https://github.com/thelazyprogrammer/Node-WebDollar.git
git checkout api_blocks
npm install
```
### 5. Start WebDollar Miner
```shell
screen # press space
npm run commands
# press 8 -> check if Blockchain is loading
# press ctrl + a and then d, to detach from screen
# screen -ls -> view screen_host
# screen -r screen_host <- connect to the screen
```
### 6. Clone WebDollar-Explorer-API
```shell
git clone https://github.com/thelazyprogrammer/webdollar-explorer-api.git
```
### 7. Start REST API
```shell
cd webdollar-explorer-api/server
npm install
npm run start
```
### 8. REST API ENDPOINTS
```http
# shows last 14 blocks
GET: /block

# shows block information
GET: /block/<block-id>

# shows miner information
GET: /miner/<miner_address>
```
### 9. Start Explorer Dashboard
```shell
cd client
npm install
npm run dev
```
