var app    = require('koa')(),
    router = require('koa-router')(),
    serve  = require('koa-static'),
    views  = require('koa-views');

//babel transformer
var babel = require("babel-core");

// Send static files
app.use(serve('./public'));

// Use html
app.use(views("./public", {map: {html: 'swig'}}));

/**
 * Routes can go both before and after but
 * app.use(router(app)); must be before
 */
router.get('/', function *( next ) {
    yield this.render('index', {my: 'data'});
});

//router
app
    .use(router.routes())
    .use(router.allowedMethods());

// This must come after last app.use()
var server = require('http').Server(app.callback()),
    io     = require('socket.io')(server);

// Socket.io
io.on('connection', function( socket ) {

    socket.on('code change', function( data ) {
        try {
            var result = babel.transform(data, {
                presets: ['react', 'es2015', 'stage-1']
                //plugins: ['transform-runtime']
            });
            socket.emit("code transformed", result.code);
        } catch ( e ) {
            //console.error(e);
            socket.emit("code error", e.message);
        }
    });
});

// Start the server
server.listen(1337);
console.info('Now running on localhost:1337');
