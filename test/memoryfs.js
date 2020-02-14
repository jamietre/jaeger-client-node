import { MemoryFs } from '../src/memoryfs';
import path from 'path';
import assert from 'assert';

describe('memoryfs', () => {
  it('simple', () => {
    const root = __dirname;
    const fs = new MemoryFs(root, {
      'foo.txt': 'bar',
      'baz/foo2.txt': 'fizz',
    });
    assert.equal(fs.readFileSync(`${root}/foo.txt`), 'bar');
    assert.equal(fs.readFileSync(`${root}/baz/foo2.txt`), 'fizz');
  });
  it('fails if file is missing', () => {
    const root = __dirname;
    const fs = new MemoryFs(root, {});
    assert.throws(() => {
      fs.readFileSync(`${root}/foo.txt`);
    });
  });
  it('relative path', () => {
    const root = path.resolve(`${__dirname}/../`);
    const fs = new MemoryFs(root, {
      'foo.txt': 'bar',
    });
    assert.equal(fs.readFileSync('../foo.txt'), 'bar');
  });
});
