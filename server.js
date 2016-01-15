//load shelljs for NPM utilities
require('shelljs/global');

//load dotenv for configuration
require('dotenv').load({silent: true});

//dependencies
var app          = require('koa')(),
    router       = require('koa-router')(),
    staticCache  = require('koa-static-cache'),
    co           = require('co'),
    path         = require("path"),
    regFs        = require('fs'),
    intersection = require("lodash.intersection"),
    union        = require('lodash.union'),
    fs           = require('co-fs'),
    lusca        = require('koa-lusca'),
    mongoose     = require('mongoose'),
    routes       = require("./routes"),
    transform    = require("./transform"),
    views        = require('koa-views');

//store our models
var models = require("./models")(mongoose);

//security config
app.use(lusca({
    xframe: 'SAMEORIGIN',
    xssProtection: true
}));

//static file server, with gzip
app.use(staticCache(path.join(__dirname, 'public'), {
    maxAge: 365 * 24 * 60 * 60,
    gzip: true,
    dynamic: true
}));

// Use html
app.use(views("./views", {map: {html: 'swig'}}));

// error handling
app.use(function *( next ) {
    try {
        yield next;
        var status = this.status || 404;
        if ( status === 404 )  yield this.render('not_found', {});
    } catch ( err ) {
        console.error(err);
        err.status = err.status || 500;
        // Set our response.
        this.status = err.status;
        yield this.render('error', {});
    }
});

//setup routes
routes(router, models);

//setup router
app
    .use(router.routes())
    .use(router.allowedMethods());

/**
 * Event handler for code being saved by the client
 */
var onCodeSaved = function*( socket, data ) {
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
                state: data.state ? JSON.stringify(data.state) : null,
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
};

var onCodeChange = function*( socket, data ) {
    try {
        //TODO Since this is a pure function, we could memoize it for performance
        var result = transform.babelTransform.transform(data.code);
        socket.emit("code transformed", result.code);

    } catch ( e ) {
        socket.emit("code error", e.message);
    }
};

//Start our Socket IO connection
var server = require('http').Server(app.callback()),
    io     = require('socket.io')(server);

io.on('connection', co.wrap(function *( socket ) {
    //listen for code saves
    socket.on('code save', co.wrap(onCodeSaved.bind(null, socket)));
    socket.on('code change', co.wrap(onCodeChange.bind(null, socket)));
}));

//Bring up the DB
mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    //ensure we have a generated folder
    var generatedFolder = path.join(__dirname, 'public/generated');
    regFs.stat(generatedFolder, function( err, stats ) {
        if ( err ) {
            console.log("making generated folder");
            regFs.mkdirSync(generatedFolder);
        }
    });

    //start the server
    var port = process.env.PORT || 3000;
    server.listen(port);

    //log the connection
    console.log('React.run started');
});


