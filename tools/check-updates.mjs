#!/usr/bin/env node
// LP（public/index.html）に載っていない新しい note 記事・登壇を洗い出す。
// 掲載はカテゴリ語と引用文の人手判断が要るので、ここでは検知して一覧を出すだけにする。
//
//   node tools/check-updates.mjs              # note と登壇の両方
//   node tools/check-updates.mjs --note-only  # note だけ（GitHub Actions 用）
//
// 標準出力に Markdown の一覧、末尾に `NEW_COUNT=<件数>` を出す。

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'public', 'index.html');
const NOTE_RSS = 'https://note.com/tsutushi0628/rss';
// 登壇資料は各プロジェクトの outreach/YYYY-MM_<slug>/ に置かれている
const PROJECTS_DIR = process.env.ST_LABO_PROJECTS_DIR || join(homedir(), 'projects');
const TALK_DIR_PATTERN = /^\d{4}-\d{2}_/;

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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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
  // 過去に載せなかった古い記事は対象外。掲載中で一番新しい記事より後に出たものだけを拾う
  const newestListed = Math.max(0, ...items.filter((i) => listed.has(i.link)).map((i) => i.date.getTime()));
  return items.filter((i) => !listed.has(i.link) && !ignored.has(i.link) && i.date.getTime() > newestListed);
}

function findNewTalks() {
  if (!existsSync(PROJECTS_DIR)) return [];
  const listed = new Set([...html.matchAll(/data-talk="([^"]+)"/g)].map(([, key]) => key));
  const found = [];
  for (const project of readdirSync(PROJECTS_DIR, { withFileTypes: true })) {
    if (!project.isDirectory()) continue;
    const outreach = join(PROJECTS_DIR, project.name, 'outreach');
    if (!existsSync(outreach)) continue;
    for (const entry of readdirSync(outreach, { withFileTypes: true })) {
      if (entry.isDirectory() && TALK_DIR_PATTERN.test(entry.name) && !listed.has(entry.name) && !ignored.has(entry.name)) {
        found.push({ project: project.name, key: entry.name });
      }
    }
  }
  return found.sort((a, b) => a.key.localeCompare(b.key));
}

const notes = await findNewNotes();
const talks = noteOnly ? [] : findNewTalks();
const fmt = (d) => d.toISOString().slice(0, 10);

console.log('## LP に未掲載の note 記事');
console.log(notes.length ? notes.map((n) => `- ${fmt(n.date)} [${n.title}](${n.link})`).join('\n') : '- なし');
if (!noteOnly) {
  console.log('\n## LP に未掲載の登壇フォルダ（data-talk に無いもの）');
  console.log(talks.length ? talks.map((t) => `- ${t.project}/outreach/${t.key}`).join('\n') : '- なし');
}
console.log(`\nNEW_COUNT=${notes.length + talks.length}`);
