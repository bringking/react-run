var fs = require('co-fs');

module.exports = {
    /**
     * Generate a folder a bin by ID
     * @param binId the ID of the bin model
     * @returns {string}
     */
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