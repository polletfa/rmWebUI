const path = require('path');

module.exports = {
    target: "web",
    entry: './_build/src/frontend/index.js',
    output: {
        path: path.resolve(__dirname, '_build/src/'),
        filename: 'frontend.js',
    },
    mode: 'production'
};
