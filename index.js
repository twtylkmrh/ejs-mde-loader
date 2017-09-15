/**
 * Created by henian.xu on 2017/9/8 0008.
 *
 */

const
    htmlMinifier = require('html-minifier'),
    attrParse = require('./libs/attributesParser'),
    loaderUtils = require('loader-utils'),
    url = require('url'),
    path = require('path'),
    merge = require('merge'),
    ejs = require('ejs');

function randomIdent() {
    return 'xxxHTMLLINKxxx' + Math.random() + Math.random() + 'xxx';
}

function getLoaderConfig(context) {
    const query = loaderUtils.getOptions(context) || {};
    const configKey = query.config || 'ejsMdeLoader';
    const config = context.options && context.options.hasOwnProperty(configKey) ? context.options[configKey] : {};
    delete query.config;
    return merge(query, config);
};

module.exports = function(source) {
    this.cacheable && this.cacheable();
    let config = getLoaderConfig(this);

    // 编译 ejs
    config.client = true;
    config.filename = path.relative(process.cwd(), this.resourcePath);
    const compile = ejs.compile(source, config);
    let content = compile();

    // 设置属性查询
    let attributes = ['img:src'];
    if (config.attrs !== undefined) {
        if (typeof config.attrs === 'string') {
            attributes = config.attrs.split(' ');
        } else if (Array.isArray(config.attrs)) {
            attributes = config.attrs;
        } else if (config.attrs === false) {
            attributes = [];
        } else {
            throw new Error('Invalid value to config parameter attrs');
        }
    }

    // 查找要替换的链接
    const root = config.root;
    let links = attrParse(content, function(tag, attr) {
        const res = attributes.find(function(a) {
            if (a.charAt(0) === ':') {
                return attr === a.slice(1);
            } else {
                return `${tag}:${attr}` === a;
            }
        });
        return !!res;
    });
    links.reverse();// 倒序

    // 链接替换占位符
    let data = {};
    content = [content];
    links.forEach(function(link) {
        if (!loaderUtils.isUrlRequest(link.value, root)) return;
        let uri = url.parse(link.value);
        if (uri.hash !== null && uri.hash !== undefined) {
            uri.hash = null;
            link.value = uri.format();
            link.length = link.value.length;
        }
        do {
            var ident = randomIdent();
        } while (data[ident]);
        data[ident] = link.value;
        let x = content.pop();
        content.push(x.substr(link.start + link.length)); // 尾
        content.push(ident); // 占位
        content.push(x.substr(0, link.start)); // 头
    });
    content.reverse();
    content = content.join('');

    // 压缩 html
    if (typeof config.minimize === 'boolean' ? config.minimize : this.minimize) {
        const minimizeOptions = merge({}, config);
        [
            'removeComments',
            'removeCommentsFromCDATA',
            'removeCDATASectionsFromCDATA',
            'collapseWhitespace',
            // 'conservativeCollapse',
            'removeAttributeQuotes',// 是否删除多余的属性引号
            'useShortDoctype',
            'keepClosingSlash',
            'minifyJS',
            'minifyCSS',
            'removeScriptTypeAttributes',
            'removeStyleTypeAttributes',
        ].forEach(function(name) {
            if (typeof minimizeOptions[name] === 'undefined') {
                minimizeOptions[name] = true;
            }
        });
        // minimizeOptions['maxLineLength'] = 0;
        content = htmlMinifier.minify(content, minimizeOptions);
    }

    content = JSON.stringify(content);

    var exportsString = 'module.exports = ';
    if (config.exportAsDefault) {
        exportsString = 'exports.default = ';
    } else if (config.exportAsEs6Default) {
        exportsString = 'export default ';
    }
    return exportsString + content.replace(/xxxHTMLLINKxxx[0-9\.]+xxx/g, function(match) {
        if (!data[match]) return match;
        // 占位符替换链接
        return '" + require(' + JSON.stringify(loaderUtils.urlToRequest(data[match], root)) + ') + "';
    }) + ';';
};
