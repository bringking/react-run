//load variables
require('shelljs/global');
require('dotenv').load({silent: true});

var app              = require('koa')(),
    router           = require('koa-router')(),
    staticCache      = require('koa-static-cache'),
    co               = require('co'),
    path             = require("path"),
    regFs            = require('fs'),
    intersection     = require("lodash.intersection"),
    union            = require('lodash.union'),
    fs               = require('co-fs'),
    mongoose         = require('mongoose'),
    fileUtils        = require("./file_utils"),
    npmUtils         = require("./npm_utils"),
    webpackTransform = require('./webpack_transform'),
    views            = require('koa-views');

//ensure we have a generated folder
var generatedFolder = path.join(__dirname, 'public/generated');
regFs.stat(generatedFolder, function( err, stats ) {
    if ( err ) {
        console.log("making generated folder");
        regFs.mkdirSync(generatedFolder);
    }
});

//store our models
var models;

//babel transformer
var babel = require("babel-core");
const detective = require('babel-plugin-detective');

//id generator
var shortid = require('shortid');

app.use(staticCache(path.join(__dirname, 'public'), {
    maxAge: 365 * 24 * 60 * 60,
    gzip: true,
    dynamic: true
}));

// Use html
app.use(views("./views", {map: {html: 'swig'}}));

router.get('/', function *() {

    //generate guid
    var id = shortid.generate();
    var newBin = new models.bin({id: id});

    var result = yield newBin.save();
    var newRevision = new models.binRevision({
        createdAt: new Date(),
        hash: 1,
        text: "",
        jsResources: [],
        cssResources: [],
        state: "{}",
        "_bin": result._id
    });

    yield newRevision.save();

    //temporary redirect
    this.redirect('/' + id + "/" + newRevision.hash);
    this.status = 302;

});

router.get('/:bin', function *() {

    var result = yield models.bin
        .findOne({'id': this.params.bin});

    //redirect to 404 if no bin
    if ( !result ) {
        this.status = 404;
        yield this.render('not_found', {});
        return;
    }

    var latestRevision = yield models.binRevision.findOne({"_bin": result._id});

    if ( !latestRevision ) {
        latestRevision = new models.binRevision({
            createdAt: new Date(),
            hash: 1,
            text: "",
            jsResources: [],
            cssResources: [],
            state: "{}",
            "_bin": result._id
        });
        yield latestRevision.save();
    }

    //temporary redirect
    this.redirect('/' + result.id + "/" + latestRevision.hash);
    this.status = 302;

});

router.get('/:bin/:revision', function *() {

    var bin = yield models.bin
        .findOne({'id': this.params.bin});

    //redirect to 404 if no bin
    if ( !bin ) {
        this.status = 404;
        yield this.render('not_found', {});
        return;
    }

    var binRevision = yield models.binRevision
        .findOne({'_bin': bin._id, 'hash': this.params.revision});

    var otherRevisions = yield models.binRevision
        .find({'_bin': bin._id}).select({'hash': 1, 'createdAt': 1});

    //redirect to 404 if no bin
    if ( !binRevision ) {
        this.status = 404;
        yield this.render('not_found', {});
        return;
    }

    yield this.render('index', {
        code: binRevision.text,
        otherRevisions: otherRevisions,
        jsResources: binRevision.jsResources,
        cssResources: binRevision.cssResources,
        state: JSON.parse(binRevision.state)
    });
});

//router
app
    .use(router.routes())
    .use(router.allowedMethods());

// This must come after last app.use()
var server = require('http').Server(app.callback()),
    io     = require('socket.io')(server);
io.on('connection', co.wrap(function *( socket ) {

    socket.on('code save', co.wrap(function *( data ) {
        try {
            if ( data.revision && data.bin && data.code ) {
                //saving
                var bin = yield models.bin.findOne({'id': data.bin});

                var latestRevision = yield models
                    .binRevision
                    .find({'_bin': bin._id}).sort('-hash')
                    .limit(1);

                //create a new revision
                var newRevision = new models.binRevision({
                    hash: latestRevision[0].hash + 1,
                    text: data.code,
                    jsResources: data.jsResources || [],
                    cssResources: data.cssResources || [],
                    state: JSON.stringify(data.state),
                    createdAt: new Date(),
                    "_bin": bin._id
                });
                var newResult = yield newRevision.save();

                //save the result
                if ( newResult ) {
                    socket.emit("code saved", {
                        bin: data.bin,
                        revision: newResult.hash,
                        jsResources: newResult.jsResources,
                        cssResources: newResult.cssResources,
                        createdAt: newResult.createdAt
                    });
                }

            }
        } catch ( e ) {
            console.error(e);
            socket.emit("error saving", {bin: data.bin, revision: data.revision});
        }
    }));

    socket.on('code change', co.wrap(function* ( data ) {
        try {
            //TODO Since this is a pure function, we could memoize it for performance
            var result = babel.transform(data.code, {
                presets: ['react', 'es2015', 'stage-1'],
                plugins: ['detective', {}]
            });

            //no imports, just use babel
            socket.emit("code transformed", result.code);

        } catch ( e ) {
            socket.emit("code error", e.message);
        }
    }));

}));

mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    //load our models
    models = require("./models")(mongoose);

    // we're connected!
    console.log('Application Started');

    //start the server
    var port = process.env.PORT || 3000;
    server.listen(port);
});


