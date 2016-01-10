//load variables
require('dotenv').load();

var app      = require('koa')(),
    router   = require('koa-router')(),
    serve    = require('koa-static'),
    webpack  = require("webpack"),
    mongoose = require('mongoose'),
    views    = require('koa-views');

//store our models
var models;
//babel transformer
var babel = require("babel-core");
//id generator
var shortid = require('shortid');

// Send static files
app.use(serve('./public'));

// Use html
app.use(views("./views", {map: {html: 'swig'}}));

router.get('/', function *( next ) {

    //generate guid
    var id = shortid.generate();
    var newBin = new models.bin({id: id});

    var result = yield newBin.save();
    var newRevision = new models.binRevision({id: "r_" + shortid.generate(), text: "", "_bin": result._id});
    var binRevision = yield newRevision.save();

    //temporary redirect
    this.redirect('/' + id);
    this.status = 302;

    yield next;

});

router.get('/:bin', function *( next ) {

    var result = yield models.bin
        .findOne({'id': this.params.bin});
    var latestRevision = yield models.binRevision.findOne({"_bin": result._id});

    if ( !latestRevision ) {
        latestRevision = new models.binRevision({id: "r_" + shortid.generate(), text: "", "_bin": result._id});
        yield latestRevision.save();
    }

    //temporary redirect
    this.redirect('/' + result.id + "/" + latestRevision.id);
    this.status = 302;

    yield next;

});

router.get('/:bin/:revision', function *( next ) {

    var bin = yield models.bin
        .findOne({'id': this.params.bin});
    var binRevision = yield models.binRevision
        .findOne({'id': this.params.revision});

    console.log(bin);
    console.log(binRevision);

    //TODO look up record, if any
    yield this.render('index', {});
});

//router
app
    .use(router.routes())
    .use(router.allowedMethods());

// This must come after last app.use()
var server = require('http').Server(app.callback()),
    io     = require('socket.io')(server);

// Socket.io
io.on('connection', function( socket ) {

    socket.on('code save', function( data ) {
        try {
            if ( data.revision && data.id && data.text ) {
                //saving
            }
        } catch ( e ) {
        }
    });

    socket.on('code change', function( data ) {
        try {
            //TODO Since this is a pure function, we could memoize it for performance
            var result = babel.transform(data, {
                presets: ['react', 'es2015', 'stage-1']
            });
            socket.emit("code transformed", result.code);

        } catch ( e ) {
            socket.emit("code error", e.message);
        }
    });
});

mongoose.connect(process.env.DB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    //load our models
    models = require("./models")(mongoose);
    // we're connected!
    console.log('connected');
    //start the server
    var port = process.env.PORT || 3000;
    server.listen(port);
});


