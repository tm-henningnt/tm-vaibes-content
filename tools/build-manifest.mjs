import fg from 'fast-glob';
import matter from 'gray-matter';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { env } from 'process';

const RAW_BASE_URL = env.DOCS_REPO_RAW_BASE_URL || 'https://raw.githubusercontent.com/tm-henningnt/tm-vaibes-content/main/';
const MANIFEST_OUTPUT_PATH = env.DOCS_REPO_MANIFEST_PATH || 'manifest.json';

const toKebabCase = (value) => {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'uncategorized';
};

const files = await fg(['docs/**/*.{md,mdx}'], { dot: false });
const docs = [];
for (const path of files) {
  const raw = readFileSync(path, 'utf8');
  const { data /*, content */ } = matter(raw);
  if (!data || !data.title) {
    console.warn(`Skipping ${path}: missing frontmatter title`);
    continue;
  }

  const normalizedPath = path.replace(/\\/g, '/');
  const relativePath = normalizedPath.replace(/^docs\//, '');
  const slug = relativePath.replace(/\.(md|mdx)$/i, '');

  const categories = Array.isArray(data.categories)
    ? data.categories.filter(Boolean)
    : [];
  const fallbackCategory = slug.split('/')[0] || 'uncategorized';
  const primaryCategory = data.primary_category || categories[0] || fallbackCategory;
  const normalizedCategory = toKebabCase(primaryCategory);

  const docEntry = {
    path: '/' + normalizedPath,
    slug,
    category: normalizedCategory,
    title: data.title,
    description: data.description,
    audience_levels: data.audience_levels || [],
    personas: data.personas || [],
    categories,
    tags: data.tags || [],
    relatedProjectTypes: data.related_project_types || [],
    search_keywords: data.search_keywords || [],
    related: data.related || [],
    sourcePath: normalizedPath,
    sourceUrl: RAW_BASE_URL.replace(/\/$/, '') + '/' + normalizedPath
  };

  if (data.min_read_minutes !== undefined) {
    docEntry.min_read_minutes = data.min_read_minutes;
  }

  if (data.last_reviewed) {
    let asDate = null;
    if (data.last_reviewed instanceof Date) {
      asDate = new Date(Date.UTC(
        data.last_reviewed.getUTCFullYear(),
        data.last_reviewed.getUTCMonth(),
        data.last_reviewed.getUTCDate()
      ));
    } else if (typeof data.last_reviewed === 'string') {
      const match = data.last_reviewed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        asDate = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
      }
    }

    if (asDate && !Number.isNaN(asDate.getTime())) {
      docEntry.lastUpdated = asDate.toISOString();
    }
  }

  docs.push(docEntry);
}

const json = {
  "$schema": "./tools/schemas/manifest.schema.json",
  version: "2025.10.1",
  generated_at: new Date().toISOString(),
  hash: "",
  docs
};

const hash = createHash('sha256')
  .update(JSON.stringify(docs, null, 2))
  .digest('hex')
  .slice(0, 16);

json.hash = hash;
writeFileSync(MANIFEST_OUTPUT_PATH, JSON.stringify(json, null, 2));
console.log(`Manifest built with hash: ${hash} and ${docs.length} docs (output: ${MANIFEST_OUTPUT_PATH}).`);
