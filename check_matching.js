import { getFlowerColor, getBloomingPeriod, isFloweringCherry, SPECIES_LABELS, formatSciLabel } from './src/constants.js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('prunus.json', 'utf8'));

const uniquePrunus = new Set(data.map(d => d.name));

for (const name of uniquePrunus) {
  const color = getFlowerColor(name);
  const bloom = getBloomingPeriod(name);
  let upper = name.trim().toUpperCase().replace(/\s+/g, " ").replace(/[`'"]/g, "");
  upper = upper.replace(/^PRUNUS X /, "PRUNUS ");
  const isFC = isFloweringCherry(name, name);

  // also check if SPECIES_LABELS has it. Note: getFlowerColor does a startsWith/includes.

  if (!color || !bloom) {
    console.log(`Missing for: ${name} -> color: ${color}, bloom: ${bloom}, isFC: ${isFC}`);
  }
}
