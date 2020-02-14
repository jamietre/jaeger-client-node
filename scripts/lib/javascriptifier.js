/* eslint-disable no-console */

/**
 * Load assets and generate javascript that lets them be statically imported.
 */

const { lstatSync, openSync, writeSync, closeSync, readFileSync, readdirSync } = require('fs');
const path = require('path');

// const pathReplacer = /[-./\\\s]/g;

// type FileSpec = {
//   fileName: string,
//   relativePath: string,
//   data: string,
// };

function processFiles(rootPath, target, filePaths) {
  const allFileSpecs = [];
  filePaths.forEach(filePath => {
    console.log(filePath);
    allFileSpecs.push(...readAllFilesRecursively(filePath, rootPath));
  });
  convertFilesToJavascript(allFileSpecs, target);
}

function readAllFilesRecursively(dirPath /*: string */, rootPath /*: string = dirPath */) /*: FileSpec[] */ {
  if (!rootPath) {
    rootPath = dirPath;
  }
  const files = readdirSync(dirPath);
  const outFiles /*: string[] */ = [];
  const children /*: string[] */ = [];

  const fileData = files
    .filter(fileName => {
      const stat = lstatSync(`${dirPath}/${fileName}`);
      if (stat.isDirectory()) {
        children.push(fileName);
        return false;
      }
      outFiles.push(fileName);
      return true;
    })
    .map(fileName => {
      const filePath = `${dirPath}/${fileName}`;
      const relativePath = slash(path.relative(rootPath, filePath));
      const data = readFileSync(filePath, 'utf-8');
      return {
        fileName,
        relativePath,
        data,
      };
    });

  // recursively call for all directories we identified before and append to the output
  const childData = children.map(fileName => readAllFilesRecursively(`${dirPath}/${fileName}`, rootPath));

  childData.forEach(data => fileData.push(...data));
  return fileData;
}

function convertFilesToJavascript(fileSpecs /*: FileSpec[] */, target /*: string */) {
  const handle = openSync(`${target}`, 'w');
  writeSync(handle, getHeader());
  fileSpecs.forEach(spec => {
    const exportName = spec.relativePath;
    writeSync(handle, Buffer.from(generateJavascript(exportName, spec.data), 'ascii'));
  });
  writeSync(handle, getFooter());
  closeSync(handle);
}

function generateJavascript(name /*: string*/, data /*: string*/) {
  const bufParts = breakString(Buffer.from(data, 'utf-8').toString('base64'), 100);
  const bufJS = bufParts.map(e => `"${e}"`).join(' +\n');

  return `"${name}": Buffer.from(
${bufJS}, "base64"
).toString("utf-8"),\n\n`;
}

function getHeader() {
  return `
/* eslint-disable camelcase */

// GENERATED CODE - DO NOT MODIFY!

module.exports = {
`;
}

function getFooter() {
  return '};\n';
}

/**
 * Break a string up into pieces of equal length
 * @argument data string
 * @argument breakpoint number
 * @returns string[]
 */
function breakString(data, breakpoint) {
  const out = [];
  let pos = 0;
  while (pos < data.length) {
    out.push(data.slice(pos, Math.min(pos + breakpoint, data.length)));
    pos += breakpoint;
  }
  return out;
}

function slash(somePath) {
  return somePath.replace(/\\/g, '/');
}

module.exports = {
  processFiles,
  convertFilesToJavascript,
  readAllFilesRecursively,
};
