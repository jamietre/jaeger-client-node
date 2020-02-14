'use strict';

var _memoryfs = require('../src/memoryfs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

describe('memoryfs', function() {
  it('simple', function() {
    var root = process.cwd();
    var fs = new _memoryfs.MemoryFs(root, {
      'foo.txt': 'bar',
      'baz/foo2.txt': 'fizz',
    });
    _assert2.default.equal(fs.readFileSync(root + '/foo.txt'), 'bar');
    _assert2.default.equal(fs.readFileSync(root + '/baz/foo2.txt'), 'fizz');
  });
  it('fails if file is missing', function() {
    var root = process.cwd();
    var fs = new _memoryfs.MemoryFs(root, {});
    _assert2.default.throws(function() {
      fs.readFileSync(root + '/foo.txt');
    });
  });
  it('relative path', function() {
    var root = _path2.default.resolve(process.cwd() + '/../');
    var fs = new _memoryfs.MemoryFs(root, {
      'foo.txt': 'bar',
    });
    _assert2.default.equal(fs.readFileSync('../foo.txt'), 'bar');
  });
});
//# sourceMappingURL=memoryfs.js.map
