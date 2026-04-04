const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

// The replacement strings had changed slightly due to the manual git diff or previous replacements.
// So let's use regex or search manually

// getFlowerColor
let i = content.indexOf('  return null;', content.indexOf('return FLOWER_COLORS[prefix];'));
if (i !== -1) {
  content = content.slice(0, i) + `  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getFlowerColor] Unmatched Prunus variety: \${scientific}\`);
  }
` + content.slice(i);
}

// isFloweringCherry
let isFC_idx = content.indexOf('return CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));');
if (isFC_idx !== -1) {
  content = content.replace('return CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));',
  `const matched = CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));
  if (!matched && upperSci.startsWith("PRUNUS") && upperSci !== "PRUNUS" && upperSci !== "PRUNUS SP") {
    console.warn(\`[isFloweringCherry] Prunus variety not in CHERRY_PREFIXES: \${scientific}\`);
  }
  return matched;`);
}

// getBloomingPeriod
let bloom_idx = content.indexOf('  return null;', content.indexOf('return BLOOMING_PERIODS[prefix];'));
if (bloom_idx !== -1) {
  content = content.slice(0, bloom_idx) + `  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getBloomingPeriod] Unmatched Prunus variety: \${scientific}\`);
  }
` + content.slice(bloom_idx);
}

fs.writeFileSync('src/constants.js', content);
