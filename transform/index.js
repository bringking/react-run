var webpackTransform = require("./webpack_transform");
var babelTransform = require("./babel_transform");

/**
 * Combine our transforms here
 * @type {{webpackTransform: (*|exports|module.exports), babelTransform: (*|exports|module.exports)}}
 */
module.exports = {
    /**
     * Transform using Webpack
     */
    webpackTransform: webpackTransform,
    /**
     * Transform using Babel only
     */
    babelTransform: babelTransform
};