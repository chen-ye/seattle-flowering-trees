const fs = require('fs');

let content = fs.readFileSync('src/data.js', 'utf8');

const oldLine1 = `  if (source.sciField) {`;
const newLine1 = `  if (source.sciField) {`; // no change actually needed there?
// Wait, if it doesn't have sciField, it fetches everything. But we want to just make sure `combinedField` is fetched.
const oldLineOutFields = `  const outFields =
    [source.sciField, source.commonField, source.condField]
      .filter(Boolean)
      .join(",") || "*";`;

const newLineOutFields = `  const outFields =
    [source.sciField, source.commonField, source.condField, source.combinedField]
      .filter(Boolean)
      .join(",") || "*";`;

content = content.replace(oldLineOutFields, newLineOutFields);
fs.writeFileSync('src/data.js', content);
