var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  CouchDB = require('nano')('http://localhost:5984').use('blockchaindb'),
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/blockchainRoutes');
routes(app);

app.listen(port);

console.log('blockchain RESTful API server started on: ' + port);
