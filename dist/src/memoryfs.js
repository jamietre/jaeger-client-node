'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.MemoryFs = undefined;

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _thrift = require('./generated/thrift');

var _thrift2 = _interopRequireDefault(_thrift);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var MemoryFs = (exports.MemoryFs = (function() {
  function MemoryFs(root, data) {
    _classCallCheck(this, MemoryFs);

    this.root = root;
    this.data = data;
  }

  _createClass(MemoryFs, [
    {
      key: 'readFileSync',
      value: function readFileSync(filePath) {
        if (!_path2.default.isAbsolute(filePath)) {
          filePath = _path2.default.join(_path2.default.resolve(__dirname, filePath));
        }

        var target = slash(_path2.default.relative(this.root, filePath));
        var out = this.data[target];
        if (!out) {
          throw new Error(
            'The path resolved to "' +
              target +
              '" was not found in MemoryFs.\nfilePath=' +
              filePath +
              '\nthis.root="' +
              this.root
          );
        }
        return out;
      },
    },
  ]);

  return MemoryFs;
})());

// ensure windows paths are stored consistently in the cache

function slash(somePath) {
  return somePath.replace(/\\/g, '/');
}

var idlFs = new MemoryFs(__dirname, _thrift2.default);

exports.default = idlFs;
//# sourceMappingURL=memoryfs.js.map
