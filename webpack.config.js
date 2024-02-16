const path = require('path');

module.exports = {
    entry: './main.js',
    mode: 'development',
    output: {
        filename: 'tetris.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
