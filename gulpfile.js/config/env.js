module.exports = function( env ) {
    var config;

    switch ( env ) {
        case "staging":
            config = require("./staging.json");
            break;
        case "production":
            config = require("./production.json");
            break;
        default:
            config = require("./local.json");
            break;

    }
    return config;
};