/**
 * Created by henian.xu on 2017/9/8 0008.
 *
 */

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

webpack(webpackConfig, function(err, stats) {
  if (err) throw err;
});