import fg from 'fast-glob';
import matter from 'gray-matter';
import { readFileSync } from 'fs';

const REQUIRED_ARRAY_FIELDS = [
  { key: 'audience_levels', minItems: 1 },
  { key: 'personas', minItems: 1 },
  { key: 'categories', minItems: 1 }
];

const OPTIONAL_ARRAY_FIELDS = [
  'tags',
  'related',
  'search_keywords',
  'related_project_types'
];

const problems = [];

const assertArrayField = (docPath, data, key, minItems = 0) => {
  const value = data[key];
  if (!Array.isArray(value)) {
    problems.push(`${docPath}: missing array for '${key}'`);
    return;
  }

  if (value.length < minItems) {
    problems.push(`${docPath}: '${key}' requires at least ${minItems} item(s)`);
  }

  const deduped = new Set(value);
  if (deduped.size !== value.length) {
    problems.push(`${docPath}: '${key}' contains duplicates -> [${value.join(', ')}]`);
  }
};

const run = async () => {
  const files = await fg(['docs/**/*.{md,mdx}'], { dot: false });

  for (const relativePath of files) {
    const raw = readFileSync(relativePath, 'utf8');
    const { data } = matter(raw);

    for (const { key, minItems } of REQUIRED_ARRAY_FIELDS) {
      assertArrayField(relativePath, data, key, minItems);
    }

    for (const key of OPTIONAL_ARRAY_FIELDS) {
      if (Array.isArray(data[key])) {
        assertArrayField(relativePath, data, key, 0);
      }
    }

    if (data.primary_category && Array.isArray(data.categories)) {
      if (!data.categories.includes(data.primary_category)) {
        problems.push(
          `${relativePath}: 'primary_category' (${data.primary_category}) is not listed in categories`
        );
      }
    }
  }

  if (problems.length) {
    console.error(`Frontmatter validation failed with ${problems.length} issue(s):`);
    console.error(problems.join('\n'));
    process.exit(1);
  }

  console.log(`Frontmatter validation passed for ${files.length} document(s).`);
};

run().catch((error) => {
  console.error('Frontmatter validation encountered an unexpected error:', error);
  process.exit(1);
});
