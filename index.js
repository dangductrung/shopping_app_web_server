const express = require('express')
const app = express();
const morgan = require('morgan')
const bodyParser = require('body-parser');

require('dotenv').config()
require('events').EventEmitter.prototype._maxListeners = 100;

const enviromentName = "dev"
app.use(morgan(enviromentName));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000

app.use('/crawl', require('./routes/crawl'));
app.use('/oauth', require('./routes/oauth'));
app.use('/search', require('./routes/search'));
app.use('/notification', require('./routes/notification'));


var server=app.listen(4000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

  
module.exports = app;