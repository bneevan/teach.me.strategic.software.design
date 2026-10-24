const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(readFileSync(path.join(root, 'assets/course-data.js'), 'utf8'), context);
const data = context.window.COURSE_DATA;

test('catalog lesson ids and flashcard ids are unique', () => {
  for (const entries of [data.lessons, data.cards]) {
    assert.equal(new Set(entries.map(item => item.id)).size, entries.length);
  }
});

test('all catalog resources and card sources exist', () => {
  for (const item of [...data.lessons, ...data.references, ...data.cards]) {
    const href = item.href || item.source;
    assert.ok(existsSync(path.join(root, href.split('#')[0])), href);
  }
});

test('lessons identify a real module and the dashboard has latest-lesson targets', () => {
  for (const lesson of data.lessons) {
    assert.ok(Number.isInteger(lesson.module) && lesson.module >= 1 && lesson.module <= data.modules.length);
  }
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const id of ['current-module', 'current-title', 'current-description', 'current-meta', 'current-link']) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
});
