var express = require('express'),
  config = require('./config')
  app = express(),
  port = process.env.PORT || config.server.port,
  bodyParser = require('body-parser'),
  expressSanitized = require('express-sanitize-escape');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/blockchainRoutes');
routes(app);

app.listen(port);

console.log('blockchain RESTful API server started on: ' + port);
