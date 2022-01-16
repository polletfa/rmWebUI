const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");

module.exports = {
    target: "web",
    entry: './_build/src/frontend/index.js',
    output: {
        path: path.resolve(__dirname, '_build/src/'),
        filename: 'frontend.js',
    },
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({extractComments: false}),
        ]
    }
};
