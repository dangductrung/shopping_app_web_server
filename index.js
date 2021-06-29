const express = require('express')
const app = express();
const morgan = require('morgan')
const bodyParser = require('body-parser');
const authhelper = require('./helper/auth.helper.js');
const schedule = require('./schedule/schedule.js');

require('dotenv').config()
require('events').EventEmitter.prototype._maxListeners = 100;

const enviromentName = "dev"
app.use(morgan(enviromentName));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000

app.use('/oauth', require('./routes/oauth'));
app.use('/search',authhelper.isAuthenticate, require('./routes/search'));
app.use('/notification',authhelper.isAuthenticate, require('./routes/notification'));
app.use('/product',authhelper.isAuthenticate, require('./routes/product'));
app.use('/follow', authhelper.isAuthenticate,require('./routes/follow'));
app.use('/profile', authhelper.isAuthenticate,require('./routes/profile'));
app.use('/fcm', authhelper.isAuthenticate,require('./routes/fcm'));
app.use('/report', authhelper.isAuthenticate,require('./routes/report'));


schedule.check_notification();

var server=app.listen(4000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

  
module.exports = app;