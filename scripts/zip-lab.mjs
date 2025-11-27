import { createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'lab');
const zipPath = path.join(rootDir, 'lab.zip');

async function ensureSourceExists() {
  try {
    await stat(sourceDir);
  } catch {
    throw new Error(`[zip-lab] 构建输出目录不存在：${sourceDir}`);
  }
}

await ensureSourceExists();

const output = createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

const archivePromise = new Promise((resolve, reject) => {
  output.on('close', () => {
    console.log(`[zip-lab] 已生成 ${zipPath} (${archive.pointer()} bytes)`);
    resolve();
  });
  output.on('error', reject);
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('[zip-lab]', err.message);
    } else {
      reject(err);
    }
  });
  archive.on('error', reject);
});

archive.pipe(output);
archive.directory(sourceDir, 'lab');
await archive.finalize();
await archivePromise;

