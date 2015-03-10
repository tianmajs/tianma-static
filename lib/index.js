'use strict';

var fs = require('co-fs'),
    ofs = require('fs'),
	path = require('path'),
	util = require('util');
	
var TEMPLATE = ofs.readFileSync(path.join(__dirname, 'list.tpl'), 'utf-8');
	
/**
 * Get the pathname of the requested file.
 * @param root {string}
 * @param pathname {string}
 * @return {string}
 */
function resolve(root, pathname) {
	pathname = path.normalize(pathname);
	pathname = path.join(root, pathname);
	
	return pathname;
}

/**
 * Get the sorted directory list;
 * @param pathname {string}
 * @param dir {string}
 * @return {string}
 */
function* list(pathname, dir) {
	var names = yield fs.readdir(dir),
		d = [],
		f = [];
		
	for (let i = 0, len = names.length; i < len; ++i) {
		let stats = yield fs.stat(path.join(dir, names[i]));
		if (stats.isDirectory()) {
			d.push(names[i] + '/');
		} else {
			f.push(names[i]);
		}
	}
	
	d.sort();
	f.sort();
	
	return util.format(TEMPLATE, pathname, d.concat(f).map(function (name) {
		return '<li><a href="' + encodeURI(name) + '">'
			+ name
			+ '</a></li>';
	}).join('\n'));
}

/**
 * Filter factory.
 * @param [account] {Object}
 * @return {Function}
 */
module.exports = function (root) {
	root = root || './';

	return function *(next) {
		var req = this.request,
			res = this.response,
			pathname = resolve(root, decodeURI(req.pathname));

		try {
			var stats = yield fs.stat(pathname);

			if (stats.isFile()) {
				res.status(200)
					.type(path.extname(pathname))
					.head('last-modified', stats.mtime.toGMTString())
					.data(yield fs.readFile(pathname));
			} else if (stats.isDirectory()) {
				res.status(200)
					.type('html')
					.head('last-modified', stats.mtime.toGMTString())
					.data(yield *list((req.base || '' + req.pathname), pathname));
			} else {
				yield next;
			}
		} catch (err) {
			if (err.code === 'ENOENT') {
                res.status(404);
				yield next;
			} else {
				throw err;
			}
		}
	};
};