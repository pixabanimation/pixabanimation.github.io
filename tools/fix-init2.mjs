import { readFileSync, writeFileSync } from "fs";

let c = readFileSync("database/init.mjs", "utf-8");

// Fix 1: Fix imageFixes array - missing closing " before ]
// Pattern: '["url1","url2]'  ->  '["url1","url2"]'
// These are JavaScript strings with valid JSON - they should have closing double quotes
c = c.replace(
  /images: '\["([^"]+)","([^"]+)\]'/g,
  (match, url1, url2) => `images: '["${url1}","${url2}"]'`
);

// Fix 2: Fix inline SQL update statements - missing closing " before ]
// Pattern: \\"url2\\]'  ->  \\"url2\\"]' 
c = c.replace(
  /\\\\"([^\\\\]+)\\\\]'/g,
  (match, url) => `\\\\"${url}\\\\"]'`
);

writeFileSync("database/init.mjs", c);
console.log("✅ Fix script 2 applied");
