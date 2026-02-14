#!/usr/bin/env node
import { existsSync, mkdirSync, createWriteStream, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));

const getFormattedSystemInfo = () => {
  const archMap: Record<string, string> = {
    'x64': 'amd64',
    'ia32': '386',
    'arm64': 'arm64',
    'arm': 'arm'
  };

  if (process.platform == 'win32') return {
    platform: 'windows',
    arch: archMap[process.arch] || process.arch,
    ext: 'dll'
  };
  if (process.platform == 'darwin') return {
    platform: 'darwin',
    arch: archMap[process.arch] || process.arch,
    ext: 'dylib'
  }
  return {
    platform: 'linux',
    arch: archMap[process.arch] || process.arch,
    ext: 'so'
  }
};

const sysInfo = getFormattedSystemInfo();
const version = '1.12.13'
const baseUrl = 'https://github.com/overthonk/azuretls-client/releases/download/';
const LIBRARY_URL = `${baseUrl}/v${version}/azuretls-${version}-${sysInfo.platform}-${sysInfo.arch}.${sysInfo.ext}`;
const LIBRARY_PATH = join(__dirname, '../native', `azuretls-${version}-${sysInfo.platform}-${sysInfo.arch}.${sysInfo.ext}`);

export const getLibraryPath = () => {
  return join(__dirname, '../native', `azuretls-${version}-${sysInfo.platform}-${sysInfo.arch}.${sysInfo.ext}`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  if (existsSync(LIBRARY_PATH)) {
    console.log('Library already exists');
    process.exit(0);
  }

  mkdirSync(dirname(LIBRARY_PATH), { recursive: true });

  const response = await fetch(LIBRARY_URL);
  if (!response.ok || !response.body) {
    console.error(`Failed to download library: ${response.statusText}`);
    process.exit(1);
  }

  const fileStream = createWriteStream(LIBRARY_PATH);
  Readable.fromWeb(response.body as any).pipe(fileStream);

  fileStream.on('finish', () => {
    if (process.platform !== 'win32') {
      chmodSync(LIBRARY_PATH, 0o755);
    }
    console.log('Library downloaded successfully');
  });

  fileStream.on('error', (err) => {
    console.error('Failed to write library:', err.message);
    process.exit(1);
  });
}