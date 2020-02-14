/* eslint-disable no-console */

/**
 * Load assets and generate javascript that lets them be statically imported.
 * API: node javascripter-cli [input1... inputx]
 */

const path = require('path');
const fs = require('fs');

const { processFiles } = require('./lib/javascriptifier');

const targetPath = 'src/generated';
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath);
}

const files = process.argv.slice(2);
const rootPath = path.resolve(path.dirname(module.filename), '../src');

processFiles(rootPath, `${targetPath}/thrift.js`, files);
