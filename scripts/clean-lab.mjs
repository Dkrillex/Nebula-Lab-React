import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targets = ['lab', 'lab.zip'];

async function removeTarget(target) {
    const targetPath = path.join(rootDir, target);
    try {
        await rm(targetPath, { recursive: true, force: true });
        console.log(`[clean-lab] removed ${targetPath}`);
    } catch (error) {
        console.error(`[clean-lab] failed to remove ${targetPath}`, error);
        throw error;
    }
}

for (const target of targets) {
    await removeTarget(target);
}

