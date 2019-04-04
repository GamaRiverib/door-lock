module.exports = {
    entry: [
      './src/index.js'
    ],
    output: {
      path: __dirname,
      publicPath: '/',
      filename: 'app.js'
    },
    module: {
      rules: [
        {
          test: /\.exec\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "script-loader"
          }
        }
      ]
    }
  };