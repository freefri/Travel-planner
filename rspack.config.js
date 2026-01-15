const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devServer: {
        port: 3005,
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'chat.js',
        library: {
            type: 'module',
        },
        publicPath: 'auto',
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)x?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
    // Treat react as peer/external if we want to share it from the host
    // but for the external team's dev kit, we might want to bundle it.
    // We can let them decide or provide a specific peer config.
    externalsType: 'module',
    externals: {
        react: 'react',
        'react-dom': 'react-dom'
    }
}
