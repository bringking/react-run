/**
 * The models for React.run
 * @param mongoose
 * @returns {{bin: (*|Aggregate|Model|*), binRevision: (*|Aggregate|Model|*)}}
 */
module.exports = function( mongoose ) {

    return {
        bin: require("./bin")(mongoose),
        binRevision: require("./bin_revision")(mongoose)
    }

};