var express = require('express');
var port = process.env.PORT || 5467;
const app = express();
const bodyParser = require("body-parser");
let cors = require('cors');

app.use(bodyParser.json({ limit: '15Mb' }));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '15Mb'
}));

// cors
app.use(cors({
    origin: true,
    credentials: true,
}));

// Add Routes
app.use('/', require('./routes'));

// server init
app.listen(port);
console.log(`App listening on port ${port}`);

app.use(function (err, req, res, next) {
    console.error('Uhnandled exception', err);
});
