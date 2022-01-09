const path = require('path');

module.exports = {
    entry: './_build/src/frontend/index.js',
    output: {
        path: path.resolve(__dirname, '_build/src/frontend/'),
        filename: 'bundle.js',
    },
    mode: 'production'
};
