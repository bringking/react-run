/**
 * The "Bin" model represents a single instance of a users code. A bin will have the relevant meta-data
 * about a piece of code.
 * @param mongoose
 * @returns {*|Aggregate|Model}
 */
module.exports = function( mongoose ) {
    var bin = mongoose.Schema({
        /**
         * The "friendly" id of the bin, not the Mongo generated ID
         */
        id: {type: String, index: true},

        /**
         * The current editor theme of the bin
         */
        currentTheme: String,

        /**
         * An array of NPM modules that the bin has installed
         */
        packages: [String]
    });

    return mongoose.model('bin', bin);
};

