var app     = require('koa')(),
    router  = require('koa-router')(),
    serve   = require('koa-static'),
    webpack = require("webpack"),
    views   = require('koa-views');

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
            //TODO Since this is a pure function, we could memoize it for performance
            var result = babel.transform(data, {
                presets: ['react', 'es2015', 'stage-1']
            });
            socket.emit("code transformed", result.code);

        } catch ( e ) {
            socket.emit("code error", e.message);
        }
    });
});

//start the server
var port = process.env.PORT || 3000;
server.listen(port);
