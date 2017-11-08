const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const package = require('./package.json');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = require('./config') || {};


const appDist = path.resolve(__dirname, './app');

module.exports = {
  entry: {
    app: './src/app/index.tsx',
    //TODO worker: './src/app/worker.ts',
  },
  output: {
    path: appDist,
    filename: '[name].js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: [ '.tsx', '.ts', '.jsx', '.js', '.json', '.scss', '.sass', '.css' ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: config.title || package.name,
      template: 'src/app/index.ejs',
      chunksSortMode: 'dependency'
    }),
    new ExtractTextPlugin('style.css')
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader'
      },
      {
        test: /\.(css|scss|sass)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })/*,
        options: {
          plugins: function() {
            return [autoprefixer, precss];
          }
        }*/
      },
      {
        test: /\.(png)$/,
        use: { loader: 'url-loader', options: { limit: 100000 } },
      }/*,
      {
        svg-loader
      }*/
    ]
  }
}
