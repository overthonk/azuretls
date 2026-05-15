#!/usr/bin/env node
import { existsSync, mkdirSync, createWriteStream, chmodSync } from 'fs';
import { Readable } from 'stream';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { LIBRARY_PATH, LIBRARY_URL, getLibraryPath } from './library-path.js';

const run = async () => {
  if (existsSync(LIBRARY_PATH)) {
    console.log('Library already exists');
    return;
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
};

export { getLibraryPath };

const scriptPath = process.argv[1] ? fileURLToPath(import.meta.url) : '';

if (process.argv[1] && scriptPath === process.argv[1]) {
  void run();
}
