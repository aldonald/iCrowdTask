const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (prod) => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'public')
    },
    module: {
      rules: [
        {
          loader: 'babel-loader',
          test: /\.js$/,
          exclude: /node_modules/
        },
        {
          use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, 'public')
            }
            }, 'css-loader'
          ],
          test: /\.css/
        }
      ]
    },
    mode: prod ? 'production' : 'development',
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          secure: false
        },
        "/auth": {
          target: "http://localhost:8000",
          secure: false
        }
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'main.css',
        chunkFilename: 'main.css',
      })
    ]
  }
}
