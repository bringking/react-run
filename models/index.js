module.exports = function( mongoose ) {

    return {
        bin: require("./bin")(mongoose),
        binRevision: require("./bin_revision")(mongoose)
    }

};