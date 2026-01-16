const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack')
const deps = require('./package.json').dependencies

module.exports = {
    entry: './src/bootstrap.tsx',
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
        publicPath: 'auto',
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
    plugins: [
      new ModuleFederationPlugin({
        name: 'mf_tutor',
        filename: 'remoteEntry.js',
        remotes: {},
        exposes: {
          './Renderer': './src/Renderer',
        },
        shared: {
          typescript: {
            singleton: true,
            requiredVersion: deps.typescript
          }
        }
      }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
    // Treat react as peer/external if we want to share it from the host
    // but for the external team's dev kit, we might want to bundle it.
    // We can let them decide or provide a specific peer config.
    externalsType: 'window',
    externals: {
        react: 'react',
        'react-dom': 'react-dom',
        'react-dom/client': 'react-dom/client',
        'react/jsx-runtime': 'react/jsx-runtime'
    }
}
