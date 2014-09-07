var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var morgan = require('morgan');

// Router
var router = express.Router();

router.use(function(req, res, next) {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
});

router.use('/js', express.static(__dirname + '/public' + '/js'));
router.use('/templates', express.static(__dirname + '/public' + '/templates'));
router.use('/css', express.static(__dirname + '/public' + '/css'));
router.use('/assets', express.static(__dirname + '/public' + '/assets'));
router.use('/fonts', express.static(__dirname + '/public' + '/fonts'));

router.all('/:id?', function (req, res) {
    res.sendfile('index.html', { root: __dirname + '/public' });
})

router.all('*', function (req, res) {
    res.send(404);
})
app.use(router);

//app.use('/', express.static(__dirname + '/public'));
//app.get('/[^\.]+$', function(req, res){
//    res.set('Content-Type', 'text/html')
//        .sendfile(__dirname + '/public/index.html');
//});
// set up our express application
//app.use('/js', express.static(__dirname + '/public' + '/js'));
//app.use('/templates', express.static(__dirname + '/public' + '/templates'));
//app.use('/css', express.static(__dirname + '/public' + '/css'));
//app.use('/assets', express.static(__dirname + '/public' + '/assets'));
//app.use('/fonts', express.static(__dirname + '/public' + '/fonts'));
////Use res.sendfile, as it streams instead of reading the file into memory.
////app.use(function(req, res) {
////    res.sendfile(__dirname + '/public/index.html');
////});
////
//app.all('/*', function(req, res, next) {
//
//    // Just send the index.html for other files to support HTML5Mode
//    res.sendfile('index.html', { root: __dirname + '/public' });
//});
//app.use(function(req, res) {
//    return res.redirect(req.protocol + '://' + req.get('Host') + req.url)
//})
//app.use('*', function (req, res) {
//    res.send(404);
//})

app.use(morgan('dev')); // log every request to the console

var io = require('socket.io').listen(
    app.listen(port, function() {
        console.log('Listening on port ' + port);
}));
