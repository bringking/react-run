var config = require('./');
// var webpack = require('webpack');
// var karmaWebpack = require('karma-webpack');
var webpackConfig = require('./webpack')('test');

module.exports = {
  plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-nyan-reporter'),
      require('karma-phantomjs2-launcher')
  ],
  basePath: './',
  frameworks: ['jasmine'],
  files: [
    'app/javascripts/__tests__/components/*-spec.js',
  ],
  preprocessors: {
    'app/javascripts/**/*.js': ['webpack']
  },
  webpack: webpackConfig,
  webpackMiddleware: {
    noInfo: true
  },
  singleRun: process.env.TRAVIS_CI === 'true',
  reporters: ['nyan'],
  browsers: ['PhantomJS2'],
  phantomjsLauncher: { 
    exitOnResourceError: true
    }
};