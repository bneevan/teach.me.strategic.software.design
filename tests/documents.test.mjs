import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documents, htmlLink, renderDocument } from '../scripts/build-docs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('local Markdown document links become HTML without losing fragments or queries', () => {
  assert.equal(htmlLink('MISSION.md'), 'MISSION.html');
  assert.equal(htmlLink('../COURSE.md#entry-and-pacing'), '../COURSE.html#entry-and-pacing');
  assert.equal(htmlLink('./RESOURCES.md?view=full#knowledge'), './RESOURCES.html?view=full#knowledge');
  assert.equal(htmlLink('https://example.org/COURSE.md'), 'https://example.org/COURSE.md');
  assert.equal(htmlLink('//example.org/COURSE.md'), '//example.org/COURSE.md');
  assert.equal(htmlLink('unrelated.md'), 'unrelated.md');
});

test('renderer preserves formatting, creates unique anchors, and nests course headings', () => {
  const html = renderDocument('# Title & purpose\n\n## Intro\n\n**Bold** and *italic* with [mission](MISSION.md).\n\n# Part I\n\n## Module\n\n## Module\n\n- One\n- Two\n', documents[0]);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<h2 id="intro">Intro<\/h2>/);
  assert.match(html, /<h2 id="part-i">Part I<\/h2>/);
  assert.match(html, /<h3 id="module-2">Module<\/h3>/);
  assert.match(html, /href="#module-2"/);
  assert.match(html, /<strong>Bold<\/strong> and <em>italic<\/em>/);
  assert.match(html, /href="MISSION.html"/);
  assert.match(html, /<title>Title &amp; purpose<\/title>/);
  assert.match(html, /<li>One<\/li>/);
});

for (const document of documents) {
  test(`${document.name}.html matches its complete Markdown source`, async () => {
    const markdown = await readFile(resolve(root, `${document.name}.md`), 'utf8');
    const generated = await readFile(resolve(root, `${document.name}.html`), 'utf8');
    assert.equal(generated, renderDocument(markdown, document), 'Run npm run build:docs after editing Markdown.');
  });
}

test('every workspace HTML link is valid and none points to raw Markdown', async () => {
  const files = [];
  for (const directory of ['', 'lessons', 'reference']) {
    for (const file of await readdir(resolve(root, directory))) {
      if (file.endsWith('.html')) files.push(resolve(root, directory, file));
    }
  }
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const href = match[1];
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
      assert.doesNotMatch(href, /\.md(?:[?#]|$)/, `${file}: raw Markdown link ${href}`);
      const [pathname, fragment] = href.split('#');
      const target = pathname ? resolve(dirname(file), pathname.split('?')[0]) : file;
      await access(target);
      if (fragment && target.endsWith('.html')) {
        const content = await readFile(target, 'utf8');
        const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map(item => item[1]);
        assert.ok(ids.includes(decodeURIComponent(fragment)), `${file}: missing anchor ${href}`);
      }
    }
  }
});
