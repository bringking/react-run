module.exports = function( mongoose ) {
    var bin = mongoose.Schema({
        id: {type:String,index: true},
        packages:[String]
    });

    return mongoose.model('bin', bin);
};

