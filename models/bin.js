module.exports = function( mongoose ) {
    var bin = mongoose.Schema({
        id: String,
        packages:[String]
    });

    return mongoose.model('bin', bin);
};

