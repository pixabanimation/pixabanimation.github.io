import { readFileSync, writeFileSync } from "fs";

let c = readFileSync("database/init.mjs", "utf-8");

// 1. Fix the broken migration regex:
//    raw.replace(/\\\\+/g, '\\\\').replace(/\\"/g, '"')
//    -> raw.replace(/\\"/g, '"')
// The first regex matches 4+ backslashes but the data only has 1.
c = c.replace(
  "raw.replace(/\\\\\\\\+/g, '\\\\').replace(/\\\\\"/g, '\"')",
  "raw.replace(/\\\\\"/g, '\"')"
);

// 2. Fix the inline SQL update statements' images strings:
//    '[\\"url\\"]'  ->  '["url"]'
//    (The double-backslash in JS strings produces literal backslash in SQL, 
//     which gets stored as-is, breaking JSON.parse)
c = c.replace(
  /images = '\[\\"([^\\]+)\\"\]'/g,
  (match, url) => `images = '["${url}"]'`
);

// 3. Remove the unused badImages query (dead code)
c = c.replace(
  /\/\/ Find products.*\n.*const badImages = await client\.execute\(\n\s+"SELECT id, images FROM products WHERE images LIKE '%\\\\%\\\\"'%' OR images LIKE '%\\\\%\\\\\\"%' OR images IS NOT NULL AND images NOT LIKE '\[%'"\n\s+\);\n\s+\/\/ Alternative approach: update any images that aren't valid JSON arrays\n\s+\/\/ We'll fix by removing backslashes before quotes\n\s+/,
  ""
);

writeFileSync("database/init.mjs", c);
console.log("✅ Fixed init.mjs");
