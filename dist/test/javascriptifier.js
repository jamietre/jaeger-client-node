'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.sequence = sequence;

var _javascriptifier = require('../scripts/lib/javascriptifier');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mockFs = require('mock-fs');

var _mockFs2 = _interopRequireDefault(_mockFs);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

function setUpNestedScenario(dirCount, filesPerDir) {
  var dirs = sequence(dirCount).map(function(i) {
    return 'dir-' + i;
  });
  dirs.forEach(function(dir) {
    return _fs2.default.mkdirSync(mockRoot + '/' + dir);
  });
  var files = [''].concat(_toConsumableArray(dirs)).map(function(dir) {
    return sequence(filesPerDir).map(function(i) {
      var fileName = 'file-' + i + '.tst';
      var filePath = dir ? dir + '/' + fileName : fileName;
      _fs2.default.writeFileSync(mockRoot + '/' + filePath, 'data-' + i + '-line-1\ndata-' + i + '-line-2');
      return filePath;
    });
  });
  return flatten(files);
}

// sanity check to make sure fs is really mocked
var mockRoot = '/' + (0, _v2.default)();

describe('readAllFilesRecursively', function() {
  beforeEach(function() {
    return (0, _mockFs2.default)(_defineProperty({}, mockRoot, {}));
  });
  afterEach(function() {
    return _mockFs2.default.restore();
  });

  it('works with no subdirectories', function() {
    var fileNames = sequence(5)
      .map(function(i) {
        var fileName = 'test-file-' + i + '.tst';
        _fs2.default.writeFileSync(mockRoot + '/' + fileName, 'test-data-' + i);
        return fileName;
      })
      .sort();

    var specs = (0, _javascriptifier.readAllFilesRecursively)(mockRoot);

    _assert2.default.deepEqual(
      specs
        .map(function(e) {
          return e.relativePath;
        })
        .sort(),
      fileNames,
      'file paths match'
    );
    _assert2.default.deepEqual(
      specs.map(function(e) {
        return e.data;
      }),
      sequence(5).map(function(i) {
        return 'test-data-' + i;
      }),
      'data matches'
    );
  });

  it('works with subdirectories', function() {
    var expectedFilePaths = setUpNestedScenario(2, 5).sort();
    var specs = (0, _javascriptifier.readAllFilesRecursively)(mockRoot);

    var actualFilePaths = specs
      .map(function(e) {
        return e.relativePath;
      })
      .sort();

    _assert2.default.deepEqual(
      expectedFilePaths,
      actualFilePaths,
      'file paths match what was returned by readAllfilesRecursively'
    );
  });
});

describe('convertFilesToJavascript', function() {
  beforeEach(function() {
    return (0, _mockFs2.default)(_defineProperty({}, mockRoot, {}));
  });
  afterEach(function() {
    return _mockFs2.default.restore();
  });

  it('creates the file as expected', function() {
    setUpNestedScenario(1, 3);
    var specs = (0, _javascriptifier.readAllFilesRecursively)(mockRoot);
    var outfile = mockRoot + '/out.js';
    (0, _javascriptifier.convertFilesToJavascript)(specs, outfile);

    var generatedFile = _fs2.default.readFileSync(outfile, 'ascii');
    var generated = eval(generatedFile + '\nmodule.exports;');

    var allKeys = Object.keys(generated).sort();
    _assert2.default.deepEqual(
      allKeys,
      ['dir-0/file-0.tst', 'dir-0/file-1.tst', 'dir-0/file-2.tst', 'file-0.tst', 'file-1.tst', 'file-2.tst'],
      'generated module keys are as expected'
    );

    var data = _fs2.default.readFileSync(mockRoot + '/dir-0/file-1.tst', 'ascii');
    _assert2.default.equal(generated['dir-0/file-1.tst'], data, 'data matches');
  });
});

function flatten(items) {
  var out = [];
  items.forEach(function(item) {
    if (Array.isArray(item)) {
      out.push.apply(out, _toConsumableArray(flatten(item)));
    } else {
      out.push(item);
    }
  });
  return out;
}

function sequence(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    out.push(i);
  }
  return out;
}
//# sourceMappingURL=javascriptifier.js.map
