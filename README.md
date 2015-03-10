## tianma-static

Static middleware for Tianma

### Getting Started

This plugin requires Tianma `>=1.0.0`

If you haven't install `tianma-static` before, Please install plugin with this command

```javascript
npm install tianma-static
```

Once `tianma-static` has been installed, then create a file named `config.js` for this plugin.

```javascript
var tianma = require('tianma'),
    static = require('tianma-static');

tianma(80).use(static('./htdocs'));
```

Now run this this command:

```javascript
node config.js
```

### Options

* source
Type: String
default:''

Config static request data source.


### Release History

* 2015-03-10  v1.0.0  First release.


### LICENSE

MIT
