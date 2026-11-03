// Tiny JSON-file store for enquiries. Good for a small business site;
// swap for a real database (MongoDB, Postgres) if volume grows.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { fileURLToPath } from 'node:url';

const DEFAULT_DIR = fileURLToPath(new URL('../data', import.meta.url));
const FILE = path.join(process.env.DATA_DIR || DEFAULT_DIR, 'enquiries.json');

let queue = Promise.resolve();

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, FILE);
}

// Serialise writes so two enquiries arriving together never clobber each other.
function locked(fn) {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

export function addEnquiry(data) {
  return locked(async () => {
    const list = await readAll();
    const enquiry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'new',
      ...data,
    };
    list.unshift(enquiry);
    await writeAll(list);
    return enquiry;
  });
}

export function listEnquiries() {
  return readAll();
}

export function updateEnquiryStatus(id, status) {
  return locked(async () => {
    const list = await readAll();
    const item = list.find((e) => e.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    await writeAll(list);
    return item;
  });
}
