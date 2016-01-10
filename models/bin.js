module.exports = function( mongoose ) {
    var bin = mongoose.Schema({
        id: String
    });

    return mongoose.model('bin', bin);
};

