const path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    target: "node",
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    externalsPresets: {
        node: true // in order to ignore built-in modules like path, fs, etc. 
    },
    entry: './_build/src/backend/index.js',
    output: {
        path: path.resolve(__dirname, '_build/src/'),
        filename: 'backend.js',
    },
    mode: 'production'
};
