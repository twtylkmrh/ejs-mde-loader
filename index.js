/**
 * Created by henian.xu on 2017/9/8 0008.
 *
 */

const ejs = require('ejs'),
    UglifyJS = require('uglify-js'),
    utils = require('loader-utils'),
    path = require('path'),
    htmlMin = require('html-minifier'),
    merge = require('merge');

module.exports = function(source) {
  this.cacheable && this.cacheable();
  const query = typeof this.query === 'object' ?
      this.query :
      utils.parseQuery(this.query || '?');
  let opts = merge(this.options[''] || {}, query);
  opts.client = true;
  // Use filenames relative to working dir, which should be project root
  opts.filename = path.relative(process.cwd(), this.resourcePath);
  if (opts.htmlMin) {
    source = htmlMin.minify(source, opts['htmlminOptions'] || {});
  }
  let compile = ejs.compile(source, opts);
  let template = compile();
  return 'module.exports = ' + JSON.stringify(template);
};