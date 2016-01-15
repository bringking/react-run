module.exports = function( mongoose ) {
    var BinRevision = mongoose.Schema({
        hash: {type:Number,index: true},
        text: String,
        state: String,
        jsResources: [String],
        cssResources: [String],
        createdAt: {type: Date},
        _bin: {type: mongoose.Schema.Types.ObjectId, ref: 'bin'}
    });

    BinRevision.index({tags: 'text'});
    return mongoose.model('binRevision', BinRevision);
};

