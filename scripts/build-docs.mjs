import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { Marked } from 'marked';

// Markdown remains authoritative. Generated HTML is checked in for offline use.
export const documents = [
  { name: 'COURSE', label: 'Full curriculum', eyebrow: 'The complete learning path' },
  { name: 'RESOURCES', label: 'Sources', eyebrow: 'Primary sources & further reading' },
  { name: 'MISSION', label: 'Mission', eyebrow: 'The reason behind the course' }
];
const root = fileURLToPath(new URL('../', import.meta.url));
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

export function htmlLink(href) {
  // Preserve external links and queries/fragments. Only rewrite known local docs.
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) return href;
  return href.replace(/(^|\/)([^/?#]+)\.md(?=[?#]|$)/, (match, prefix, name) =>
    documents.some(doc => doc.name === name) ? `${prefix}${name}.html` : match);
}

export function renderDocument(markdown, document) {
  const headings = [];
  const ids = new Map();
  let title = document.label;
  let seenTitle = false;
  let pageHeading = '';
  let inPart = false;
  const parser = new Marked();
  parser.use({
    walkTokens(token) {
      if (token.type === 'link') token.href = htmlLink(token.href);
    },
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = tokens.map(token => token.raw).join('').replace(/[*_`]/g, '');
        const slug = plain.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
        const count = (ids.get(slug) || 0) + 1;
        ids.set(slug, count);
        const id = count > 1 ? `${slug}-${count}` : slug;
        let level = depth;
        if (depth === 1 && !seenTitle) {
          title = plain;
          seenTitle = true;
          pageHeading = `<h1 id="${escape(id)}">${text}</h1>`;
          return '';
        } else {
          // The curriculum uses H1 for parts. Keep a single page H1 and nest modules.
          if (depth === 1) { level = 2; inPart = true; }
          else if (inPart) level = Math.min(depth + 1, 6);
          headings.push({ id, text, level });
        }
        return `<h${level} id="${escape(id)}">${text}</h${level}>\n`;
      }
    }
  });
  const content = parser.parse(markdown);
  const navigation = [
    { href: 'index.html', label: 'Dashboard' },
    { href: 'flashcards.html', label: 'Flashcards' },
    ...documents.map(doc => ({ href: `${doc.name}.html`, label: doc.label }))
  ].map(link => `<a href="${link.href}"${link.href === `${document.name}.html` ? ' aria-current="page"' : ''}>${escape(link.label)}</a>`).join('');
  const toc = headings.map(heading => `<li class="toc-level-${heading.level}"><a href="#${escape(heading.id)}">${heading.text}</a></li>`).join('\n');
  return `<!doctype html>
<!-- Generated from ${document.name}.md. Edit the Markdown and run npm run build:docs. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><link rel="stylesheet" href="assets/course.css"><link rel="stylesheet" href="assets/documents.css"></head>
<body><main class="document-page" id="top">
<nav aria-label="Main navigation">${navigation}</nav>
<p class="eyebrow">${escape(document.eyebrow)}</p>
${pageHeading}
<details class="document-toc" open><summary>On this page</summary><ol>${toc}</ol></details>
<article>${content}</article>
<footer><a href="#top">Back to top ↑</a> · <a href="index.html">Return to dashboard</a><p>Generated from the course Markdown. Content changes belong in ${document.name}.md; rebuild with <code>npm run build:docs</code>. This page works offline without JavaScript.</p></footer>
</main></body></html>
`;
}

export async function buildDocuments() {
  for (const document of documents) {
    const markdown = await readFile(resolve(root, `${document.name}.md`), 'utf8');
    await writeFile(resolve(root, `${document.name}.html`), renderDocument(markdown, document));
    console.log(`Generated ${document.name}.html`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildDocuments();
