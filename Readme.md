# Deploy a WebDollar Blockchain Explorer API

### 1. Install Ubuntu 16.04 or 18.04

### 2. sudo apt update && sudo apt upgrade

### 3. Install nodejs (long term support version):
```bash
sudo apt update && sudo apt upgrade # reboot if needed

sudo dpkg --add-architecture i386
sudo apt install -y build-essential linuxbrew-wrapper erlang libssl-dev:i386

# install nvm
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.profile

# install nodejs
nvm install v8.12.0
# hack to use the latest lts
nvm install v8.12.0
```

### 4 Clone Node-WebDollar
```bash
git clone https://github.com/thelazyprogrammer/Node-WebDollar.git
git checkout latest_master
npm install
```

### 5. Start WebDollar Syncer
```bash
screen # press space
npm run start
# press ctrl + a and then d, to detach from screen
# screen -ls -> view screen_host
# screen -r screen_host <- connect to the screen
```

### 6. Clone WebDollar-Explorer-API
```bash
git clone https://github.com/thelazyprogrammer/webdollar-explorer-api.git
```

### 7. Start REST API on port 3333
```bash
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
### 9. Start Explorer Dashboard on port 10001
```bash
pushd client
npm install
npm run dev
```
