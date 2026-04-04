const fs = require('fs');

let content = fs.readFileSync('src/data.js', 'utf8');

const replacement = `  return pages.flat().map((f) => {
    const p = f.properties || {};
    let sci = ((source.sciField && p[source.sciField]) || "").trim();
    let com = ((source.commonField && p[source.commonField]) || "").trim();
    const cond = ((source.condField && p[source.condField]) || "").trim();

    // Normalization for specific data sources that combine scientific and common names
    if (source.extractSpecies) {
       const extracted = source.extractSpecies(sci || com || p[source.combinedField] || "");
       sci = extracted.sci || sci;
       com = extracted.com || com;
    }

    return {
      ...f,
      properties: {
        _scientific: sci,
        _common: com || sci || "Unknown",
        _condition: cond,
        _source: source.label,
        _color: source.color,
        _is_cherry: isFloweringCherry(com || sci, sci),
        _flower_color: getFlowerColor(sci),
        _blooming: getBloomingPeriod(sci),
      },
    };
  }).filter(f => {
    if (source.extractSpecies) {
      // If we don't have a specific sciField to filter by 'PRUNUS' in the API query,
      // we need to filter here.
      return f.properties._scientific.toUpperCase().includes('PRUNUS');
    }
    return true;
  });`;

content = content.replace(/  return pages\.flat\(\)\.map\(\(f\) => \{[\s\S]*?\}\);\n  \}\);/, replacement);
fs.writeFileSync('src/data.js', content);
