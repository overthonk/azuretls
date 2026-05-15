import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const version = '1.12.14';

const getFormattedSystemInfo = () => {
  const archMap: Record<string, string> = {
    x64: 'amd64',
    ia32: '386',
    arm64: 'arm64',
    arm: 'arm'
  };

  if (process.platform === 'win32') {
    return {
      platform: 'windows',
      arch: archMap[process.arch] || process.arch,
      ext: 'dll'
    };
  }

  if (process.platform === 'darwin') {
    return {
      platform: 'darwin',
      arch: archMap[process.arch] || process.arch,
      ext: 'dylib'
    };
  }

  return {
    platform: 'linux',
    arch: archMap[process.arch] || process.arch,
    ext: 'so'
  };
};

const sysInfo = getFormattedSystemInfo();

export const LIBRARY_FILENAME = `azuretls-${version}-${sysInfo.platform}-${sysInfo.arch}.${sysInfo.ext}`;
export const LIBRARY_URL = `https://github.com/overthonk/azuretls-client/releases/download/v${version}/${LIBRARY_FILENAME}`;
export const LIBRARY_PATH = join(__dirname, '../native', LIBRARY_FILENAME);

export const getLibraryPath = () => LIBRARY_PATH;
