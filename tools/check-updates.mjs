#!/usr/bin/env node
// LP（public/index.html）に載っていない新しい note 記事・登壇を洗い出す。
// 掲載はカテゴリ語と引用文の人手判断が要るので、ここでは検知して一覧を出すだけにする。
//
//   node tools/check-updates.mjs              # note と登壇の両方
//   node tools/check-updates.mjs --note-only  # note だけ（GitHub Actions 用）
//
// 標準出力に Markdown の一覧、末尾に `NEW_COUNT=<件数>` を出す。

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'public', 'index.html');
const NOTE_RSS = 'https://note.com/tsutushi0628/rss';
// 登壇資料は各プロジェクトの outreach/YYYY-MM_<slug>/ に置かれている
const PROJECTS_DIR = process.env.ST_LABO_PROJECTS_DIR || join(homedir(), 'projects');
const TALK_DIR_PATTERN = /^\d{4}-\d{2}_/;
// この日より前の記事は掲載を判断済み。以降に出た記事は、載せるか ignore に書くまで毎回出す
const NOTE_SINCE = new Date('2026-10-08T00:00:00+09:00');

const IGNORE = join(ROOT, 'tools', 'check-updates.ignore');

const noteOnly = process.argv.includes('--note-only');
const html = readFileSync(INDEX, 'utf8');
// 載せないと決めた note の URL・登壇フォルダ名（1行1件、# 以降はコメント）
const ignored = new Set(
  existsSync(IGNORE)
    ? readFileSync(IGNORE, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
    : [],
);

function decode(text) {
  return text
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

async function findNewNotes() {
  const res = await fetch(NOTE_RSS);
  if (!res.ok) throw new Error(`note RSS の取得に失敗: HTTP ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, body]) => {
    const pick = (tag) => decode(body.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? '');
    return { title: pick('title'), link: pick('link'), date: new Date(pick('pubDate')) };
  });
  const listed = new Set([...html.matchAll(/href="(https:\/\/note\.com\/[^"]+)"/g)].map(([, url]) => url));
  // 日付が読めない記事は取りこぼさないよう対象に含める
  const isRecent = (i) => Number.isNaN(i.date.getTime()) || i.date >= NOTE_SINCE;
  return items.filter((i) => !listed.has(i.link) && !ignored.has(i.link) && isRecent(i));
}

function findNewTalks() {
  if (!existsSync(PROJECTS_DIR)) return [];
  const listed = new Set([...html.matchAll(/data-talk="([^"]+)"/g)].map(([, key]) => key));
  const found = [];
  // シンボリックリンクのプロジェクトも拾うため stat で判定し、読めないフォルダは飛ばす
  const isDir = (path) => {
    try {
      return statSync(path).isDirectory();
    } catch {
      return false;
    }
  };
  for (const project of readdirSync(PROJECTS_DIR)) {
    const outreach = join(PROJECTS_DIR, project, 'outreach');
    if (!isDir(outreach)) continue;
    let entries;
    try {
      entries = readdirSync(outreach);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (TALK_DIR_PATTERN.test(name) && isDir(join(outreach, name)) && !listed.has(name) && !ignored.has(name)) {
        found.push({ project, key: name });
      }
    }
  }
  return found.sort((a, b) => a.key.localeCompare(b.key));
}

const notes = await findNewNotes();
const talks = noteOnly ? [] : findNewTalks();
const fmt = (d) => (Number.isNaN(d.getTime()) ? '日付不明' : d.toISOString().slice(0, 10));
const escapeMd = (text) => text.replace(/([\\\[\]])/g, '\\$1');

console.log('## LP に未掲載の note 記事');
console.log(notes.length ? notes.map((n) => `- ${fmt(n.date)} [${escapeMd(n.title)}](${n.link})`).join('\n') : '- なし');
if (!noteOnly) {
  console.log('\n## LP に未掲載の登壇フォルダ（data-talk に無いもの）');
  console.log(talks.length ? talks.map((t) => `- ${t.project}/outreach/${t.key}`).join('\n') : '- なし');
}
console.log(`\nNEW_COUNT=${notes.length + talks.length}`);
