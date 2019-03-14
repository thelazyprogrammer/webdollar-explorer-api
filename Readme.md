# WebDollar Blockchain Explorer [![Build Status](https://travis-ci.com/thelazyprogrammer/webdollar-explorer-api.svg?branch=master)](https://travis-ci.com/thelazyprogrammer/webdollar-explorer-api)

This project allows to deploy a complete, scalable and fast service to access WebDollar.io blockchain.

## WebDollar Blockchain Explorer Architecture v1

![webdollar network](https://user-images.githubusercontent.com/1412442/47714291-29fb7680-dc45-11e8-9001-0ebfe0b74487.png)

## Deploy WebDollar Blockchain Explorer

### 1. Install Ubuntu 16.04 or 18.04

### 2. sudo apt update && sudo apt upgrade

### 3. Install nodejs (long term support version) and mongodb:
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

# install mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
release=$(lsb_release -a 2>/dev/null | grep Codename | awk  '{print $2}')

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu ${release}/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list

sudo apt update
sudo apt-get install -y mongodb-org
sudo service mongod start
```

### 4. Clone Node-WebDollar
```bash
git clone https://github.com/WebDollar/Node-WebDollar.git
cd Node-WebDollar
git remote add lazy https://github.com/thelazyprogrammer/Node-WebDollar.git
git fetch lazy
git cherry-pick 5264fe57bb708018ba93a1013179ba3bbe224b04
npm install
```

### 5. Start WebDollar Syncer on port 3333
```bash
screen 
SERVER_PORT=3333 npm run start
# press ctrl + a and then d, to detach from screen
# screen -ls -> view screen_host
# screen -r screen_host <- connect to the screen
```

### 6. Deploy REST API and dashboard
```bash
git clone https://github.com/thelazyprogrammer/webdollar-explorer-api.git
```

### 7. Start REST API on port 3000
```bash
cd webdollar-explorer-api/server
npm install
npm install -g forever
# if you want to start the REST API on other port,
# modify the port here: webdollar-explorer-api/server/config.js
# set config.server.port = YOUR_REST_API_PORT
npm run start
# you should seee a forever process
# forever list
```
### 9. Start Explorer Dashboard on port 10001
```bash
pushd client
npm install
npm run dev
```
