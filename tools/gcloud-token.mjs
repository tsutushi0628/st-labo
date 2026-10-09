// gcloud に登録済みの個人アカウントでアクセストークンを取る（tools/ の共通部品）。
// アカウントは ST_LABO_ACCOUNT、無ければこのリポジトリの git config user.email を使う。

import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function run(cmd, args, cwd) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', cwd, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    throw new Error(`${cmd} ${args.join(' ')} に失敗: ${(err.stderr || err.message).trim()}`);
  }
}

export function personalAccount() {
  if (process.env.ST_LABO_ACCOUNT) return process.env.ST_LABO_ACCOUNT;
  return run('git', ['config', 'user.email'], dirname(fileURLToPath(import.meta.url)));
}

// impersonate を渡すと、そのサービスアカウントになりすましたトークンを返す
export function accessToken({ impersonate, scopes } = {}) {
  const args = ['auth', 'print-access-token', `--account=${personalAccount()}`];
  if (impersonate) args.push(`--impersonate-service-account=${impersonate}`);
  if (scopes) args.push(`--scopes=${scopes.join(',')}`);
  return run('gcloud', args);
}
