const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CopyRspackPlugin } = require('@rspack/core')

module.exports = {
    entry: {
        travel: './src/bootstrap.tsx',
        preview: './src/preview/bootstrap.tsx',
    },
    mode: 'development',
    devServer: {
        port: 3010,
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production' ? '/Travel-planner/' : '/',
    },
    experiments: {},
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
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            inject: true,
            chunks: ['travel'],
        }),
        // GitHub Pages serves a folder's index.html, which gives the preview its /preview/ route.
        new HtmlWebpackPlugin({
            template: './public/preview.html',
            filename: 'preview/index.html',
            inject: true,
            chunks: ['preview'],
        }),
        new CopyRspackPlugin({
            patterns: [{ from: './src/preview/trip.schema.json', to: 'preview/schema.json' }],
        }),
    ],
    // For a standalone prototype, we bundle React.
    externals: {}
}
