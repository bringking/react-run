module.exports = function( mongoose ) {
    var BinRevision = mongoose.Schema({
        id: String,
        text: String,
        _bin: {type: mongoose.Schema.Types.ObjectId, ref: 'bin'}
    });

    return mongoose.model('binRevision', BinRevision);
};

