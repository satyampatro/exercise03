// configure env vaiables
require('dotenv').config();

var express = require('express');
var port = process.env.PORT || 5467;
const app = express();
const bodyParser = require("body-parser");

// Initialize postgres db
let dbUtils = require('./util/db')

app.use(bodyParser.json({ limit: '15Mb' }));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '15Mb'
}));

//Check db connectivity
app.use(function (req, res, next) {
    dbUtils.checkDbConnectivity();
    next();
});


// Setup cron job
let CronJob = require('cron').CronJob;
let filmLocationModule = require('./modules/film_location');
// runs every day to check and update new film locations
new CronJob('00 00 00 * * *', function () {
    filmLocationModule.updateFilmLocations();
}, null, true, 'Asia/Kolkata');

filmLocationModule.updateFilmLocations();


// Add Routes
app.use('/', require('./routes'));

// server init
app.listen(port);
console.log(`App listening on port ${port}`);

app.use(function (err, req, res, next) {
    if (err) {
        console.error('Uhnandled exception', err);
    }
});
