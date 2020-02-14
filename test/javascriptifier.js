import { readAllFilesRecursively, convertFilesToJavascript } from '../scripts/lib/javascriptifier';
import fs from 'fs';
import mockfs from 'mock-fs';
import uuid from 'uuid/v4';
import assert from 'assert';

function setUpNestedScenario(dirCount: number, filesPerDir: number): string[] {
  const dirs = sequence(dirCount).map(i => `dir-${i}`);
  dirs.forEach(dir => fs.mkdirSync(`${mockRoot}/${dir}`));
  const files = ['', ...dirs].map(dir => {
    return sequence(filesPerDir).map(i => {
      const fileName = `file-${i}.tst`;
      const filePath = dir ? `${dir}/${fileName}` : fileName;
      fs.writeFileSync(`${mockRoot}/${filePath}`, `data-${i}-line-1\ndata-${i}-line-2`);
      return filePath;
    });
  });
  return flatten(files);
}

// sanity check to make sure fs is really mocked
const mockRoot = `/${uuid()}`;

describe('readAllFilesRecursively', () => {
  beforeEach(() => mockfs({ [mockRoot]: {} }));
  afterEach(() => mockfs.restore());

  it('works with no subdirectories', () => {
    const fileNames = sequence(5)
      .map(i => {
        const fileName = `test-file-${i}.tst`;
        fs.writeFileSync(`${mockRoot}/${fileName}`, `test-data-${i}`);
        return fileName;
      })
      .sort();

    const specs = readAllFilesRecursively(mockRoot);

    assert.deepEqual(specs.map(e => e.relativePath).sort(), fileNames, 'file paths match');
    assert.deepEqual(specs.map(e => e.data), sequence(5).map(i => `test-data-${i}`), 'data matches');
  });

  it('works with subdirectories', () => {
    const expectedFilePaths = setUpNestedScenario(2, 5).sort();
    const specs = readAllFilesRecursively(mockRoot);

    const actualFilePaths = specs.map(e => e.relativePath).sort();

    assert.deepEqual(
      expectedFilePaths,
      actualFilePaths,
      'file paths match what was returned by readAllfilesRecursively'
    );
  });
});

describe('convertFilesToJavascript', () => {
  beforeEach(() => mockfs({ [mockRoot]: {} }));
  afterEach(() => mockfs.restore());

  it('creates the file as expected', () => {
    setUpNestedScenario(1, 3);
    const specs = readAllFilesRecursively(mockRoot);
    const outfile = `${mockRoot}/out.js`;
    convertFilesToJavascript(specs, outfile);

    const generatedFile = fs.readFileSync(outfile, 'ascii');
    const generated = eval(`${generatedFile}\nmodule.exports;`);

    const allKeys = Object.keys(generated).sort();
    assert.deepEqual(
      allKeys,
      ['dir-0/file-0.tst', 'dir-0/file-1.tst', 'dir-0/file-2.tst', 'file-0.tst', 'file-1.tst', 'file-2.tst'],
      'generated module keys are as expected'
    );

    const data = fs.readFileSync(`${mockRoot}/dir-0/file-1.tst`, 'ascii');
    assert.equal(generated['dir-0/file-1.tst'], data, 'data matches');
  });
});

function flatten<T>(items: Array<T | Array<T>>): T[] {
  const out: T[] = [];
  items.forEach(item => {
    if (Array.isArray(item)) {
      out.push(...flatten(item));
    } else {
      out.push(item);
    }
  });
  return out;
}

export function sequence(n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(i);
  }
  return out;
}
