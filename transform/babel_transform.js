//babel transformer
var babel = require("babel-core");
const detective = require('babel-plugin-detective');

module.exports = {
    transform: function( code ) {
        return babel.transform(code, {
            presets: ['react', 'es2015', 'stage-1'],
            plugins: ['detective', {}]
        });
    }
};