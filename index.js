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
      utils.parseQuery(this.query);
  let opts = merge(this.options[''] || {}, query);
  opts.client = true;

  // Skip compile debug for production when running with
  // webpack --optimize-minimize
  if (this.minimize && opts.compileDebug === undefined) {
    opts.compileDebug = false;
  }
  // Use filenames relative to working dir, which should be project root
  opts.filename = path.relative(process.cwd(), this.resourcePath);

  if (opts.htmlMin) {
    source = htmlMin.minify(source, opts['htmlminOptions'] || {});
  }

  let template = ejs.compile(source, opts);

  // Beautify javascript code
  if (!this.minimize && opts.beautify !== false) {
    const ast = UglifyJS.parse(template.toString());
    ast.figure_out_scope();
    template = ast.print_to_string({beautify: true});
  }

  return 'module.exports = ' + template;

};