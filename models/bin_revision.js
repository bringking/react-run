module.exports = function( mongoose ) {
    var BinRevision = mongoose.Schema({
        hash: String,
        text: String,
        createdAt: {type: Date},
        _bin: {type: mongoose.Schema.Types.ObjectId, ref: 'bin'}
    });

    return mongoose.model('binRevision', BinRevision);
};
