#!/usr/bin/env node
// public/ を Firebase Hosting（サイト st-labo）へ出す。
// Firebase CLI の個人アカウントのログインが切れていても出せるよう、Hosting REST API を直接使う。
//
//   node tools/deploy-hosting.mjs
//
// 認証は gcloud に登録済みの個人アカウントのトークン（tools/gcloud-token.mjs）。
// firebase.json の hosting は public・ignore（既定の3パターン）・headers（source 指定）だけに対応し、それ以外があれば止まる。

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { accessToken } from './gcloud-token.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'st-labo';
const API = 'https://firebasehosting.googleapis.com/v1beta1';

const firebaseJson = JSON.parse(readFileSync(join(ROOT, 'firebase.json'), 'utf8')).hosting;
const PUBLIC_DIR = join(ROOT, firebaseJson.public);
const DEFAULT_IGNORE = ['firebase.json', '**/.*', '**/node_modules/**'];

// 対応していない設定を黙って捨てると firebase deploy と結果が食い違うので、ここで止める
const unsupported = Object.keys(firebaseJson).filter((key) => !['public', 'ignore', 'headers'].includes(key));
if ((firebaseJson.ignore || []).some((pattern) => !DEFAULT_IGNORE.includes(pattern))) unsupported.push('ignore（既定以外）');
if ((firebaseJson.headers || []).some((h) => !h.source)) unsupported.push('headers（regex 指定）');
if (unsupported.length) {
  console.error(`firebase.json の hosting に未対応の設定がある: ${unsupported.join(', ')}。firebase deploy --only hosting を使う`);
  process.exit(1);
}

const token = accessToken();

async function call(method, url, body, contentType = 'application/json') {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': SITE,
      'Content-Type': contentType,
    },
    body: body === undefined ? undefined : contentType === 'application/json' ? JSON.stringify(body) : body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> HTTP ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

// firebase.json の ignore（.で始まるもの・node_modules・firebase.json）に当たるファイルは出さない
function listFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'firebase.json') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...listFiles(path));
    else files.push(path);
  }
  return files;
}

const config = {
  headers: (firebaseJson.headers || []).map(({ source, headers }) => ({
    glob: source,
    headers: Object.fromEntries(headers.map(({ key, value }) => [key, value])),
  })),
};

const version = await call('POST', `${API}/sites/${SITE}/versions`, { config });
console.log(`バージョン作成: ${version.name}`);

try {
  const gzipped = new Map(); // hash -> gzip 済みの中身
  const manifest = {};
  for (const path of listFiles(PUBLIC_DIR)) {
    const gz = gzipSync(readFileSync(path), { level: 9 });
    const hash = createHash('sha256').update(gz).digest('hex');
    gzipped.set(hash, gz);
    manifest['/' + relative(PUBLIC_DIR, path).split(sep).join('/')] = hash;
  }

  const { uploadRequiredHashes = [], uploadUrl } = await call('POST', `${API}/${version.name}:populateFiles`, {
    files: manifest,
  });
  for (const hash of uploadRequiredHashes) {
    await call('POST', `${uploadUrl}/${hash}`, gzipped.get(hash), 'application/octet-stream');
  }
  console.log(`ファイル ${Object.keys(manifest).length} 件（うちアップロード ${uploadRequiredHashes.length} 件）`);

  await call('PATCH', `${API}/${version.name}?update_mask=status`, { status: 'FINALIZED' });
  const release = await call('POST', `${API}/sites/${SITE}/releases?versionName=${encodeURIComponent(version.name)}`);
  console.log(`公開: ${release.name}`);
} catch (err) {
  // 途中で失敗したバージョンを未確定のまま残さない
  await call('PATCH', `${API}/${version.name}?update_mask=status`, { status: 'ABANDONED' }).catch(() => {});
  console.error(`失敗したので ${version.name} を破棄した`);
  throw err;
}
