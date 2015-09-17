var paths = require('./');
var webpack = require('webpack');
var webpackManifest = require('../lib/webpackManifest');

module.exports = function( env ) {

    var jsSrc = paths.sourceAssets + '/javascripts/';
    var jsDest = paths.publicAssets + '/javascripts/';
    var publicPath = '/javascripts/';

    var webpackConfig = {
        entry: {
            client: [jsSrc + "client.js"]
        },

        output: {
            path: jsDest,
            filename: env === 'production' ? '[name]-[hash].js' : '[name].js',
            publicPath: publicPath
        },

        plugins: [],

        resolve: {
            extensions: ['', '.js', '.jsx', '.json']
        },

        module: {
            loaders: [
                {test: /\.jsx$/, exclude: [/node_modules/], loader: 'babel?stage=0'},
                {test: /\.js$/, exclude: [/node_modules/], loader: 'babel?stage=0'}
            ]
        }
    };

    if ( env === 'development' ) {
        webpackConfig.devtool = 'source-map';
        webpack.debug = true;
    }

    if ( env == 'test' ) {
        return {
            debug: true,
            node: {
                fs: 'empty'
            },
            resolve: {
                extensions: ['', '.js', '.jsx', '.json']
            },
            module: {
                loaders: [
                    {test: /\.jsx$/, exclude: [/node_modules/], loader: 'babel?stage=0'},
                    {test: /\.js$/, exclude: [/node_modules/], loader: 'babel?stage=0'}
                ]
            }
        }
    }

    if ( env === 'production' || env === 'staging' ) {
        webpackConfig.plugins.push(
            new webpackManifest(publicPath, 'public'),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.NoErrorsPlugin()
        )
    }

    return webpackConfig
};
