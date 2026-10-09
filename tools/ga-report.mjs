#!/usr/bin/env node
// GA4（プロパティ st-labo）の直近7日の数字を Markdown で出す。比較用に前の7日も並べる。
//
//   node tools/ga-report.mjs
//
// 認証は読み取り専用サービスアカウント ga-reader になりすましたトークン（鍵ファイルなし）。
// 個人アカウント（tools/gcloud-token.mjs）に ga-reader のトークン作成者ロールが付いている前提。

import { accessToken } from './gcloud-token.mjs';

const PROPERTY = 'properties/542917172';
const token = accessToken({
  impersonate: 'ga-reader@st-labo.iam.gserviceaccount.com',
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

async function report(body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${PROPERTY}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GA Data API -> HTTP ${res.status}: ${text.slice(0, 300)}`);
  const json = JSON.parse(text);
  return (json.rows || []).map((row) => ({
    dims: (row.dimensionValues || []).map((v) => v.value),
    mets: row.metricValues.map((v) => Number(v.value)),
  }));
}

const THIS_WEEK = { startDate: '7daysAgo', endDate: 'yesterday', name: 'this' };
const LAST_WEEK = { startDate: '14daysAgo', endDate: '8daysAgo', name: 'last' };
const byDesc = (metricName) => [{ metric: { metricName }, desc: true }];

const [totals, sources, clicks] = await Promise.all([
  report({
  // 期間を2つ渡すと、各行に期間名（this／last）が自動で付く
  dateRanges: [THIS_WEEK, LAST_WEEK],
  metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagedSessions' }, { name: 'screenPageViews' }],
  }),
  report({
  dateRanges: [THIS_WEEK],
  dimensions: [{ name: 'sessionSourceMedium' }],
  metrics: [{ name: 'sessions' }],
  orderBys: byDesc('sessions'),
  limit: 5,
  }),
  report({
  dateRanges: [THIS_WEEK],
  dimensions: [{ name: 'contentType' }, { name: 'contentId' }],
  metrics: [{ name: 'eventCount' }],
  dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'select_content' } } },
  orderBys: byDesc('eventCount'),
  limit: 15,
  }),
]);
const pick = (name) => totals.find((r) => r.dims[0] === name)?.mets ?? [0, 0, 0, 0];
const [now, prev] = [pick('this'), pick('last')];

const LABELS = ['来た人', '訪問', 'ちゃんと見た訪問', 'ページ表示'];
console.log('## GA4 直近7日（前の7日）');
LABELS.forEach((label, i) => console.log(`- ${label}: ${now[i]}（${prev[i]}）`));
console.log('\n### 流入元');
console.log(sources.length ? sources.map((r) => `- ${r.dims[0]}: ${r.mets[0]}`).join('\n') : '- なし');
console.log('\n### 押されたもの（work＝作品カード、work_link／talk／reading／social／about／other＝外へのリンク）');
console.log(clicks.length ? clicks.map((r) => `- ${r.dims[0]} ${r.dims[1]}: ${r.mets[0]}`).join('\n') : '- なし');
