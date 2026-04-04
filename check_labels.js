import { FLOWER_COLORS, SPECIES_LABELS, BLOOMING_PERIODS, isFloweringCherry } from './src/constants.js';

const required = [
  "PRUNUS AMERICANA",
  "PRUNUS CAROLINIANA",
  "PRUNUS ILICIFOLIA",
  "PRUNUS LUSITANICA",
  "PRUNUS SALICINA",
  "PRUNUS SERRULA",
  "PRUNUS X BLIREANA",
  "PRUNUS DOMESTICA",
  "PRUNUS PUGETENSIS",
  "PRUNUS YEDEOENSIS"
];

for (const req of required) {
  let name = req.replace("PRUNUS X ", "PRUNUS ");
  console.log(`${req}:`);
  console.log(`  Color: ${FLOWER_COLORS[name]}`);
  console.log(`  Label: ${SPECIES_LABELS[name]}`);
  console.log(`  Bloom: ${BLOOMING_PERIODS[name]}`);
  console.log(`  isFloweringCherry: ${isFloweringCherry(req, req)}`);
}
