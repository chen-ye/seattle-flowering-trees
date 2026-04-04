const fs = require('fs');
let content = fs.readFileSync('src/data.js', 'utf8');

const oldCode = `  return pages.flat().map((f) => {
    const p = f.properties || {};
    const sci = ((source.sciField && p[source.sciField]) || "").trim();
    const com = ((source.commonField && p[source.commonField]) || "").trim();
    const cond = ((source.condField && p[source.condField]) || "").trim();

    return {
      ...f,
      properties: {
        _scientific: sci,
        _common: com || sci || "Unknown",
        _condition: cond,
        _source: source.label,
        _color: source.color,
        _is_cherry: isFloweringCherry(com, sci),
        _flower_color: getFlowerColor(sci),
        _blooming: getBloomingPeriod(sci),
      },
    };
  });`;

const newCode = `  return pages.flat().map((f) => {
    const p = f.properties || {};
    let sci = ((source.sciField && p[source.sciField]) || "").trim();
    let com = ((source.commonField && p[source.commonField]) || "").trim();
    const cond = ((source.condField && p[source.condField]) || "").trim();

    if (source.extractSpecies) {
      const val = (sci || com || p[source.combinedField] || "").trim();
      const extracted = source.extractSpecies(val);
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
    if (source.extractSpecies && !source.sciField) {
      return f.properties._scientific.toUpperCase().includes('PRUNUS');
    }
    return true;
  });`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/data.js', content);
