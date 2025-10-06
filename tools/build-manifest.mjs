import fg from 'fast-glob';
import matter from 'gray-matter';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';

const files = await fg(['docs/**/*.{md,mdx}'], { dot: false });
const docs = [];
for (const path of files) {
  const raw = readFileSync(path, 'utf8');
  const { data /*, content */ } = matter(raw);
  if (!data || !data.title) {
    console.warn(`Skipping ${path}: missing frontmatter title`);
    continue;
  }
  docs.push({
    path: '/' + path.replace(/\\/g, '/'),
    title: data.title,
    description: data.description,
    audience_levels: data.audience_levels || [],
    personas: data.personas || [],
    categories: data.categories || [],
    tags: data.tags || [],
    min_read_minutes: data.min_read_minutes || null,
    last_reviewed: data.last_reviewed || null,
    search_keywords: data.search_keywords || [],
    related: data.related || []
  });
}

const json = {
  "$schema": "./tools/schemas/manifest.schema.json",
  version: "2025.10.0",
  generated_at: new Date().toISOString(),
  hash: "",
  docs
};

const hash = createHash('sha256')
  .update(JSON.stringify(docs, null, 2))
  .digest('hex')
  .slice(0, 16);

json.hash = hash;
writeFileSync('manifest.json', JSON.stringify(json, null, 2));
console.log(`Manifest built with hash: ${hash} and ${docs.length} docs.`);
