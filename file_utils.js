var fs = require('co-fs');

module.exports = {
    generateFolderForBin: function*( binId ) {
        var folder = "./public/generated/" + binId;
        var result = yield fs.exists(folder);
        if ( !result ) {
            yield fs.mkdir(folder);
            return folder;
        }
        return folder;
    }
};