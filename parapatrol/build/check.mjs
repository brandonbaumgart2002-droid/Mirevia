import { themeCheckRun } from '@shopify/theme-check-node';
// Runs Shopify Theme Check on ../shopify
import path from 'path';
const root = path.resolve('../shopify');
const res = await themeCheckRun(root, undefined, () => {});
const offenses = res.offenses || res;
for (const o of offenses) console.log(`${o.severity} ${o.check} ${o.uri.replace(/.*shopify\//,'')}:${o.start?.line+1} ${o.message}`);
console.log('total', offenses.length);
