var MemoryFileSystem = require("memory-fs");
var fs = new MemoryFileSystem(); // Optionally pass a javascript object
var realFs = require('fs');

module.exports = function( socket, code ) {

    var sanitized = socket.id.replace('/', '');
    var inputFileName = sanitized + ".js";
    var outputFileName = "compiled_" + sanitized + ".js";

    if ( !realFs.existsSync("./generated") ) {
        realFs.mkdirSync("./generated");
    }

    //create a temp file
    realFs.writeFileSync("./generated/" + inputFileName, code);

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

};