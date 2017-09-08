/**
 * Created by henian.xu on 2017/9/8 0008.
 *
 */

const assert = require('assert');

var tpl = require('./template.ejs');

assert.equal(tpl({noun: 'World'}), 'Hello, World!\r\n');