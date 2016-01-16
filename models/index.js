/**
 * The models for React.run
 * @param mongoose
 * @returns {{bin: (*|Aggregate|Model|*), binRevision: (*|Aggregate|Model|*)}}
 */
module.exports = function( mongoose ) {

    //TODO I would like to stop calling these "bins", that was a placeholder name
    return {
        bin: require("./bin")(mongoose),
        binRevision: require("./bin_revision")(mongoose)
    }

};