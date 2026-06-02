import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const src = path.join(repo, 'src');
const appMain = path.join(src, 'app', '(main)');
const nextConfig = fs.readFileSync(path.join(repo, 'next.config.ts'), 'utf8');

const implemented = new Set();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name === 'page.tsx') {
      const route = '/' + path.relative(appMain, path.dirname(full)).split(path.sep).join('/');
      implemented.add(route === '/.' ? '/dashboard' : route);
    }
  }
}
walk(appMain);

const sourceFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(full);
  }
}
collect(src);

const hrefs = new Set();
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/href:\s*['"]([^'"]+)/g)) hrefs.add(match[1]);
  for (const match of text.matchAll(/href=[{]?[`'"]([^`'"{}]+)/g)) hrefs.add(match[1]);
  for (const match of text.matchAll(/navigate\(['"]([^'"]+)/g)) hrefs.add(match[1]);
}

const missing = [];
for (const href of hrefs) {
  if (!href.startsWith('/') || href.startsWith('/api') || href.includes('${') || href.includes('$') || href === '/') continue;
  const clean = href.split('?')[0];
  const coveredByRedirect = nextConfig.includes(`source: '${clean}'`) || nextConfig.includes(`source: "${clean}"`);
  if (!implemented.has(clean) && !coveredByRedirect) missing.push(clean);
}

if (missing.length) {
  console.error('Missing route coverage:');
  for (const route of [...new Set(missing)].sort()) console.error(`  ${route}`);
  process.exit(1);
}

console.log(`Route smoke check passed: ${implemented.size} pages, ${hrefs.size} href/navigation refs.`);
