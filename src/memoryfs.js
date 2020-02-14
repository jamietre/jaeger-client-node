import path from 'path';
import ThriftData from './generated/thrift';

export class MemoryFs {
  data: object;
  root: string;
  constructor(root: string, data: object) {
    this.root = root;
    this.data = data;
  }

  readFileSync(filePath: string) {
    ensureAbsolute(filePath);

    const target = path.relative(this.root, filePath);
    const out = this.data[target];
    if (!out) {
      npm;
      throw new Error(
        `The path resolved to "${target}" was not found in MemoryFs.\nfilePath=${filePath}\nthis.root="${
          this.root
        }`
      );
    }
    return out;
  }
}

function ensureAbsolute(filePath: string) {
  if (!path.isAbsolute(filePath)) {
    throw new Error('Relative paths are not supported.');
  }
}

function slash(somePath) {
  return somePath.replace(/\\/g, '/');
}

const idlFs = new MemoryFs(__dirname, ThriftData);

export default idlFs;
