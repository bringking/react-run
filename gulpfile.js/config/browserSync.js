var config = require('./');

module.exports = {
    port: 8000,
    proxy: "http://localhost:3000",
    files: ['public/**/*.html']
};
