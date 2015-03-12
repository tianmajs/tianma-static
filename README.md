# tianma-static

![build status](https://travis-ci.org/tianmajs/tianma-static.svg?branch=master)

Static middleware for Tianma

### Getting Started

This plugin requires Tianma `>=1.0.0`

If you haven't install `tianma-static` before, Please install plugin with this command

```javascript
npm install tianma-static
```


### Example

#### Create a static http service.

```javascript
var tianma = require('tianma'),
    static = require('tianma-static');

tianma(8080).use(static('./htdocs'));
```

### Options

#### root

Type: String

default:'./'

Static request data source.

#### base

Type: String

default: ''

Virtual path for request pathname.

#### autoIndex

Type: Boolean

default: false

Automatically index files and directory.

#### indexes

Type: Array

default: []

Show the pages when access directory.

### LICENSE

MIT
