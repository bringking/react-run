var intersection = require("lodash.intersection"),
    union        = require('lodash.union'),
    difference   = require('lodash.difference'),
    fs           = require('co-fs');

module.exports = {
    installPackagesToBin: function*( binModel, binId, packages ) {
        console.log(`Installing Modules for bin ${binId}`);

        //getting the bin, to check for existing modules
        var bin = yield binModel.findOne({'id': binId});

        //no packages stored
        var packagesToInstall = [];

        //determine what to install
        if ( !bin.packages || !bin.packages.length ) {
            bin.packages = packages;
            packagesToInstall = packages;
        } else {
            packagesToInstall = difference(packages, bin.packages);
        }

        //remove empty strings
        packagesToInstall = packagesToInstall.filter(function( p ) {
            return p;
        });

        //return since all the packages have been installed already
        if ( !packagesToInstall.length ) {
            console.log("npm NotRun");
            return {error: false, type: "NotRun", message: "All packages installed"}
        }

        //install these packages
        console.log(`install ${packagesToInstall}`);

        //TODO run through webpack to get the modules
        //ensure we create a folder
        var folder = "./public/generated/" + binId;
        var result = yield fs.exists(folder);
        if ( !result ) {
            yield fs.mkdir(folder);
            //create package.json
            yield fs.writeFile(folder + "/package.json", '{}');
        }

        //run the npm install
        var npmInstall = exec(`npm install --prefix ${folder} ${packagesToInstall.join(' ')}`, {silent: false});

        if ( npmInstall.code !== 0 ) {
            console.log("npm failed");
            return {
                error: true,
                message: "NPM install failed with command " + npmInstall.code,
                output: npmInstall.output
            }

        }

        //save the bin with the new info
        bin.packages = union(bin.packages, packages);
        var saveBinResult = yield bin.save();

        //couldn't save the package install
        if ( !saveBinResult ) {
            console.log("save bin failed");
            return {error: true, message: "Error saving packages to run"}
        }

        return {error: false, message: `Successfully installed ${packagesToInstall.join(' ')}`};
    }
};