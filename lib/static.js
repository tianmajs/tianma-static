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
function resolve(root, base, pathname) {
    pathname = path.normalize(pathname);
    pathname = pathname.substring(base.length);
    pathname = path.join(root, pathname);
    return pathname < root ? root : pathname;
}

/**
 * Get the sorted directory list;
 * @param pathname {string}
 * @param dir {string}
 * @param indexes {Array}
 * @return {string}
 */
function* list(pathname, dir, indexes) {
    var names = yield fs.readdir(dir),
        d = [],
        f = [],
        index;

    if ((index = findIndex(names, indexes))) {
        return yield fs.readFile(path.join(dir, index));
    } else {
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
}

/**
 * Find a possible index file among the given filenames.
 * @param filenames {Array}
 * @pararm indexes {Array}
 * @return {string|null}
 */
function findIndex(filenames, indexes) {
    var len = indexes.length,
        i = 0,
        index;

    for (; i < len; ++i) {
        index = indexes[i];
        if (filenames.indexOf(index) !== -1) {
            return index;
        }
    }

    return null;
}

/**
 * Filter factory.
 * @param [config] {Object}
 * @return {Function}
 */
module.exports = function (config) {
    config = config || {};

    if (typeof config == 'string') {
        config = {
            root: config
        };
    }
    var root = config.root || './',
        autoIndex = typeof config.autoIndex == 'undefined' ? true : config.autoIndex,
        base = config.base || '',
        indexes = config.indexes || [];

    return function *(next) {
        var req = this.request,
            res = this.response,
            pathname = resolve(root, base, decodeURI(req.pathname));

        try {
            var stats = yield fs.stat(pathname);

            if (stats.isFile()) {
                res.status(200)
                    .type(path.extname(pathname))
                    .head('last-modified', stats.mtime.toGMTString())
                    .data(yield fs.readFile(pathname));
            }
            else if (stats.isDirectory()) {
                if (!autoIndex) {
                    res.status(403)
                        .data('Forbidden to access!');
                } else {
                    res.status(200)
                        .type('html')
                        .head('last-modified', stats.mtime.toGMTString())
                        .data(yield *list((req.base || '' + req.pathname), pathname, indexes));
                }
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