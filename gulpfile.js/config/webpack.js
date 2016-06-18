var paths = require('./');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = function(env) {

  var jsSrc = paths.sourceAssets + '/javascripts/';
  var jsDest = paths.publicAssets + '/javascripts/';
  var publicPath = '/javascripts/';

  var babelJsxLoader = {
    test: /\.jsx$/, exclude: [/node_modules/], loader: 'babel', query: {
      presets: ['react', 'es2015', 'stage-1'],
      plugins: ['transform-runtime'],
      cacheDirectory: true
    }
  };
  var babelJsLoader = {
    test: /\.js$/, exclude: [/node_modules/], loader: 'babel', query: {
      presets: ['react', 'es2015', 'stage-1'],
      plugins: ['transform-runtime'],
      cacheDirectory: true
    }
  };

  var webpackConfig = {
    entry: {
      client: [jsSrc + "client.js"]
    },

    output: {
      path: jsDest,
      filename: '[name].js',
      publicPath: publicPath
    },

    plugins: [],

    resolve: {
      modulesDirectories: ['', paths.sourceAssets + '/javascripts/lib', 'node_modules'],
      extensions: ['', '.js', '.jsx', '.json']
    },

    module: {
      loaders: [
        babelJsLoader, babelJsxLoader
      ]
    }
  };

  if (env === 'development') {
    //webpackConfig.devtool = 'source-map';
    webpack.debug = true;
  }

  if (env == 'test') {
    return {
      debug: true,
      node: {
        fs: 'empty'
      },
      resolve: {
        modulesDirectories: ['', paths.sourceAssets + '/javascripts/lib', 'node_modules'],
        extensions: ['', '.js', '.jsx', '.json']
      },
      module: {
        loaders: [
          babelJsLoader, babelJsxLoader
        ]
      }
    }
  }

  if (env === 'production' || env === 'staging') {

    // add optimize plugin
    babelJsxLoader.query.presets.push("react-optimize");
    babelJsLoader.query.presets.push("react-optimize");

    webpackConfig.output.filename = '[name].[hash].js';

    webpackConfig.plugins.push(
      new AssetsPlugin({ fullPath: true }),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin()
    )
  }

  return webpackConfig
};
