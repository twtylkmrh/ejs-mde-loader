/**
 * Created by henian.xu on 2017/9/8 0008.
 *
 */

module.exports = {
  entry: './app.js',
  cache: false,
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        loader: require.resolve('../index.js'),
        query: {
          htmlmin: true,
        },
      },
    ],
  },
};