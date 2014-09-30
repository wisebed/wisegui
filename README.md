# WiseGui

'WiseGui' is the graphical frontend to the SmartSantander and WISEBED Internet-of-Things (IoT) / wireless sensor network testbeds developed in the European research projects [SmartSantander](http://www.smartsantander.eu) and [WISEBED](http://wisebed.eu). It is a single page application executed completely in an experimenters browser and coded against the REST API of the testbeds back end [Testbed Runtime](https://github.com/itm/testbed-runtime) (TR). It is typically part of TR and served by its internal Web server.

## Building

WiseGui uses the [npm module system](https://www.npmjs.org/) for dependency resolution and modularization of its own classes. It is built using [Grunt](http://gruntjs.com/), invoking (besides others) [Browserify](http://browserify.org/) to create a single JS file out of the dependency tree and [UglifyJS 2](https://github.com/mishoo/UglifyJS2) for minification.

To build WiseGui simply invoke:

```
npm install && grunt
```

The result of the build process can then be found in the ```dist/``` subdirectory, generated class documentation in ```docs/```.

## License

WiseGui is developed as an Open Source project under the terms of the MIT license. Please see LICENSE.md for details.