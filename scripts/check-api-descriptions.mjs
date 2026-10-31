// Fails when a documented component property has no JSDoc description.
// Run after `npm run docs:api`: node scripts/check-api-descriptions.mjs
import { readFileSync } from 'node:fs';

const api = JSON.parse(readFileSync(new URL('../docs/generated/api.json', import.meta.url), 'utf8'));
const missing = [];
for (const component of Object.values(api.components)) {
  for (const property of component.props) if (!property.description) missing.push(`${component.name}.${property.name} (${property.source})`);
}
if (missing.length) {
  console.error(`${missing.length} properties have no description:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log('Every component property has a description.');
