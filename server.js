var app     = require('koa')(),
    router  = require('koa-router')(),
    serve   = require('koa-static'),
    webpack = require("webpack"),
    views   = require('koa-views');

var MemoryFileSystem = require("memory-fs");
var fs = new MemoryFileSystem(); // Optionally pass a javascript object
var realFs = require('fs');
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

            var sanitized = socket.id.replace('/', '');
            var inputFileName = sanitized + ".js";
            var outputFileName = "compiled_" + sanitized + ".js";

            if ( !realFs.existsSync("./generated") ) {
                realFs.mkdirSync("./generated");
            }

            //create a temp file
            realFs.writeFileSync("./generated/" + inputFileName, data);

            var babelJsLoader = {
                test: /\.js$/, exclude: [/node_modules/], loader: 'babel', query: {
                    presets: ['react', 'es2015', 'stage-1'],
                    plugins: ['transform-runtime']
                }
            };

            var config = {
                entry: "./generated/" + inputFileName,
                module: {
                    loaders: [
                        babelJsLoader
                    ]
                },
                plugins: [],
                resolve: {
                    extensions: ['', '.js', '.jsx', '.json']
                },
                output: {
                    path: "/",
                    filename: outputFileName
                }
            };

            //minify
            config.plugins.push(
                new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': JSON.stringify('production')
                    }
                }),
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin()
            );

            var compiler = webpack(config);
            compiler.outputFileSystem = fs;

            compiler.run(function( err, stats ) {

                if ( !err ) {
                    fs.readFile("/" + outputFileName, "utf-8", function( err, data ) {
                        socket.emit("code transformed", data);
                    });
                } else {
                    console.log(err);
                }

            });

            //TODO Since this is a pure function, we could memoize it for performance
            /* var result = babel.transform(data, {
             presets: ['react', 'es2015', 'stage-1']
             //plugins: ['transform-runtime']
             });*/

        } catch ( e ) {
            console.error(e);
            socket.emit("code error", e.message);
        }
    });
});

//start the server
var port = process.env.PORT || 3000;
server.listen(port);
