var express = require('express');
var app = express();
var port = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.html');
});

var io = require('socket.io').listen(
    app.listen(port, function() {
        console.log('Listening on port ' + port);
}));
