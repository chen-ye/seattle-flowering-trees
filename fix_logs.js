const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

content = content.replace(`  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getFlowerColor] Unmatched Prunus variety: \${scientific}\`);
  }
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getFlowerColor] Unmatched Prunus variety: \${scientific}\`);
  }`, `  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getFlowerColor] Unmatched Prunus variety: \${scientific}\`);
  }`);

content = content.replace(`  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getBloomingPeriod] Unmatched Prunus variety: \${scientific}\`);
  }
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getBloomingPeriod] Unmatched Prunus variety: \${scientific}\`);
  }`, `  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getBloomingPeriod] Unmatched Prunus variety: \${scientific}\`);
  }`);

fs.writeFileSync('src/constants.js', content);
