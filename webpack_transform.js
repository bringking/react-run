var MemoryFileSystem = require("memory-fs"),
    fs               = new MemoryFileSystem(), // Optionally pass a javascript object
    coFs             = require('co-fs-plus'),
    co               = require('co'),
    webpack          = require('webpack'),
    path             = require("path");

/**
 * The babel loader to use for react
 * @type {{test: RegExp, exclude: RegExp[], loader: string, query: {presets: string[], plugins: string[]}}}
 */
var babelJsLoader = {
    test: /\.js$/, exclude: [/node_modules/], loader: 'babel', query: {
        presets: ['react', 'es2015', 'stage-1'],
        plugins: ['transform-runtime']
    }
};

module.exports = {
    /**
     * Compile a bin model and revision with webpack, splitting the code into a main file and
     * a common chunk. The function returns the relative path to the commons file, and the contents of the main file
     * @param binModel
     * @param binId
     * @param revisionId
     * @param code
     * @param regenerateCommon
     * @returns {{error: boolean, message: string}}
     */
    compileWithWebpack: function*( binModel, binId, revisionId, code, regenerateCommon ) {


        //write our temp code file
        var binFolder = __dirname + "/public/generated/" + binId;

        //generate our input files
        var tmpFile = binFolder + `/${binId}_${revisionId}.js`;
        var tmpDummy = binFolder + `/${binId}_${revisionId}_dummy.js`;
        try {
            yield coFs.writeFile(tmpFile, code);
            yield coFs.writeFile(tmpDummy, code);
        } catch ( e ) {
            //failed to write the temp file
            console.error(`Failed to generate temporary file for build - ${tmpFile}`);
            console.error(e);
            return {error: true, message: "Failed to generate temporary file for build"};
        }

        var config = {
            //trick the chunk plugin to make two chunks
            entry: {main: tmpFile, dummy: tmpDummy},
            module: {
                loaders: [
                    babelJsLoader
                ]
            },
            plugins: [],
            resolve: {
                extensions: ['', '.js', '.jsx', '.json']
            },
            externals: {
                "react": "React",
                "react-dom":"ReactDOM"
            },
            output: {
                path: regenerateCommon ? binFolder + "/" : "/",
                filename: "[name].entry.chunk.js"
            }
        };

        //use the commons chunk
        config.plugins.push(
            new webpack.optimize.CommonsChunkPlugin("commons.chunk.js")
        );

        //compile the new code
        var compiler = webpack(config);
        if ( !regenerateCommon ) {
            compiler.outputFileSystem = fs;
        }

        return co(function* () {
            return yield new Promise(function( resolve, reject ) {
                //return the common chunk and the code
                compiler.run(co.wrap(function*( err, stats ) {
                    if ( !err ) {

                        //remove the tmp file
                        yield coFs.unlink(tmpFile);
                        yield coFs.unlink(tmpDummy);

                        //get input data
                        var main;
                        if ( regenerateCommon ) {
                            main = yield coFs.readFile(binFolder + "/main.entry.chunk.js", 'utf8');
                        } else {
                            main = fs.readFileSync("/main.entry.chunk.js", "utf8");
                        }

                        //delete the tmp files
                        if ( regenerateCommon ) {
                            yield coFs.unlink(binFolder + "/dummy.entry.chunk.js");
                            yield coFs.unlink(binFolder + "/main.entry.chunk.js");
                        }

                        //return the path to the commons, and the main file from memory or disk
                        resolve({
                            common: `/generated/${binId}/commons.chunk.js`,
                            main: main
                        });

                    } else {
                        reject(err);
                    }
                }));
            });

        })

    }
};