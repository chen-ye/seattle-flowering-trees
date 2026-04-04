const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

// Update getFlowerColor
content = content.replace(
`  for (const prefix of FLOWER_COLOR_KEYS) {
    if (upper.startsWith(prefix) || upper.includes(prefix.replace("PRUNUS ", ""))) {
      return FLOWER_COLORS[prefix];
    }
  }
  return null;`,
`  for (const prefix of FLOWER_COLOR_KEYS) {
    if (upper.startsWith(prefix) || upper.includes(prefix.replace("PRUNUS ", ""))) {
      return FLOWER_COLORS[prefix];
    }
  }
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getFlowerColor] Unmatched Prunus variety: \${scientific}\`);
  }
  return null;`
);

// Update isFloweringCherry
content = content.replace(
`  return CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));`,
`  const matched = CHERRY_PREFIXES.some((prefix) => upperSci.startsWith(prefix) || upperSci.includes(prefix.replace("PRUNUS ", "")));
  if (!matched && upperSci.startsWith("PRUNUS") && upperSci !== "PRUNUS" && upperSci !== "PRUNUS SP") {
    // Some are genuinely not flowering cherries (e.g. laurels, plums), but log anyway to catch misses
    console.warn(\`[isFloweringCherry] Prunus variety not in CHERRY_PREFIXES (might be correct if not a cherry): \${scientific}\`);
  }
  return matched;`
);

// Update getBloomingPeriod
content = content.replace(
`  for (const prefix of BLOOMING_KEYS) {
    if (upper.startsWith(prefix) || upper.includes(prefix.replace("PRUNUS ", ""))) {
      return BLOOMING_PERIODS[prefix];
    }
  }
  return null;`,
`  for (const prefix of BLOOMING_KEYS) {
    if (upper.startsWith(prefix) || upper.includes(prefix.replace("PRUNUS ", ""))) {
      return BLOOMING_PERIODS[prefix];
    }
  }
  if (upper.startsWith("PRUNUS") && upper !== "PRUNUS" && upper !== "PRUNUS SP") {
    console.warn(\`[getBloomingPeriod] Unmatched Prunus variety: \${scientific}\`);
  }
  return null;`
);

// formatSciLabel actually doesn't use a dictionary, it just formats. So no dictionary fallthrough to warn about.
fs.writeFileSync('src/constants.js', content);
