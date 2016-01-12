var intersection = require("lodash.intersection"),
    union        = require('lodash.union'),
    difference   = require('lodash.difference'),
    fileUtils    = require('./file_utils'),
    fs           = require('co-fs');

module.exports = {
    getPackageJson: function*( binId ) {

    },
    preCheck: function*( binModel, binId, packages ) {
        //getting the bin, to check for existing modules
        var bin = yield binModel.findOne({'id': binId});

        //no packages stored
        var packagesToInstall = [];

        //determine what to install
        if ( !bin.packages || !bin.packages.length ) {
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
            console.log("NPM Precheck failed, no packages to install");
            return {error: false, type: "NotRun", message: "All packages installed"}
        }

        return {error: false, type: "Install", bin: bin, packagesToInstall: packagesToInstall};

    },
    installPackagesToBin: function*( bin, binId, packagesToInstall ) {
        console.log(`Installing Modules for bin ${binId}`);

        //install these packages
        console.log(`install ${packagesToInstall}`);

        //ensure we create a folder
        var folder = yield fileUtils.generateFolderForBin(binId);
        var packageJson = yield fs.exists(folder + "/package.json");
        if ( !packageJson ) {
            yield fs.writeFile(folder + "/package.json", '{}');
        }

        //run the npm install
        var npmInstall = exec(`npm install --save --prefix ${folder} ${packagesToInstall.join(' ')}`, {silent: false});

        if ( npmInstall.code !== 0 ) {
            console.log("npm failed");
            return {
                error: true,
                message: "NPM install failed with command " + npmInstall.code,
                output: npmInstall.output
            }

        }

        //save the bin with the new info
        bin.packages = union(bin.packages, packagesToInstall);
        var saveBinResult = yield bin.save();

        //couldn't save the package install
        if ( !saveBinResult ) {
            console.log("save bin failed");
            return {error: true, message: "Error saving packages to run"}
        }

        return {error: false, message: `Successfully installed ${packagesToInstall.join(' ')}`};
    }
};