var shortid = require('shortid');

module.exports = function( router, models ) {
    /**
     * On the intital route, we should make a new "bin" and create the first revision
     * Once it is created, redirect them to that page
     */
    router.get('/', function *() {

        //generate guid
        var id = shortid.generate();
        var newBin = new models.bin({id: id, currentTheme: "solarized_dark"});

        var result = yield newBin.save();
        var newRevision = new models.binRevision({
            createdAt: new Date(),
            hash: 1,
            text: "",
            jsResources: [],
            cssResources: [],
            "_bin": result._id
        });

        yield newRevision.save();

        //temporary redirect
        this.redirect('/' + id + "/" + newRevision.hash);
        this.status = 302;

    });

    /**
     * Allow users to link directly to a "bin". If they do, get the latest revision and
     * send them there
     */
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
                "_bin": result._id
            });
            yield latestRevision.save();
        }

        //temporary redirect
        this.redirect('/' + result.id + "/" + latestRevision.hash);
        this.status = 302;

    });
    /**
     * This route will load a bin and a revision by ID
     */
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
            currentTheme: bin.currentTheme,
            state: binRevision.state ? JSON.parse(binRevision.state) : null
        });
    });
};