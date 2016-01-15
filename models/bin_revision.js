/**
 * A "BinRevision" represents one revision of a users piece of code. It has a reference to it's
 * parent "Bin"
 * @param mongoose
 * @returns {*|Aggregate|Model}
 */
module.exports = function( mongoose ) {

    var BinRevision = mongoose.Schema({
        /**
         * The hash or version of this revision
         */
        hash: {type: Number, index: true},
        /**
         * The text (e.g code) of the revision
         */
        text: String,
        /**
         * The serialized state of the revision if any
         */
        state: String,
        /**
         * An array of JavaScript resources to load
         */
        jsResources: [String],
        /**
         * An array of CSS resources to load
         */
        cssResources: [String],
        /**
         * The created date of this revision
         */
        createdAt: {type: Date},
        /**
         * The associated "Bin"
         */
        _bin: {type: mongoose.Schema.Types.ObjectId, ref: 'bin'}
    });

    return mongoose.model('binRevision', BinRevision);
};

