var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var morgan = require('morgan');

// set up our express application
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); // log every request to the console

var io = require('socket.io').listen(
    app.listen(port, function() {
        console.log('Listening on port ' + port);
}));
