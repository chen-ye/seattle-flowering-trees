import {
  SCI_ALIASES,
  COMMON_ALIASES,
  COND_ALIASES,
  SIZE_ALIASES,
  isFloweringCherry,
  getFlowerColor,
  getBloomingPeriod,
} from "./constants.js";

function matchField(names, aliases) {
  const upper = names.map((n) => n.toUpperCase());
  for (const alias of aliases) {
    const i = upper.indexOf(alias);
    if (i >= 0) return names[i];
  }
  for (const alias of aliases) {
    const n = upper.find((u) => u.startsWith(alias));
    if (n) return names[upper.indexOf(n)];
  }
  return null;
}

export async function discoverFields(source) {
  if (!source.base) return;
  let meta;
  try {
    const res = await fetch(`${source.base}?f=json`);
    meta = await res.json();
  } catch (e) {
    console.warn(
      `[${source.label}] discoverFields failed (network/CORS):`,
      e.message,
    );
    source.sciField = null;
    source.commonField = null;
    source.condField = null;
    source.sizeField = null;
    source.statusClause = null;
    return;
  }

  if (meta.error) {
    console.warn(
      `[${source.label}] discoverFields ArcGIS error:`,
      JSON.stringify(meta.error),
    );
    source.sciField = null;
    source.commonField = null;
    source.condField = null;
    source.statusClause = null;
    return;
  }

  const fields = (meta.fields || []).map((f) => f.name);
  source.sciField = source.sciField ?? matchField(fields, SCI_ALIASES) ?? null;
  source.commonField = source.commonField ?? matchField(fields, COMMON_ALIASES) ?? null;
  source.condField = source.condField ?? matchField(fields, COND_ALIASES) ?? null;
  source.sizeField = source.sizeField ?? matchField(fields, SIZE_ALIASES) ?? null;

  if (fields.some((n) => n.toUpperCase() === "CURRENT_STATUS")) {
    source.statusClause = "CURRENT_STATUS = 'INSVC'";
  } else {
    source.statusClause = null;
  }

  console.log(`[${source.label}] fields — combined: ${source.combinedField}, sci: ${source.sciField}, common: ${source.commonField}, cond: ${source.condField}, size: ${source.sizeField}`);
}

const PAGE_SIZE = 2000;


export async function fetchSourceData(source) {
  if (!source.base) return [];
  await discoverFields(source);

    const whereParts = [];
  if (source.combinedField) {
    whereParts.push(`UPPER(${source.combinedField}) LIKE 'PRUNUS%'`);
  } else if (source.sciField) {
    whereParts.push(`UPPER(${source.sciField}) LIKE 'PRUNUS%'`);
  } else {
    whereParts.push("1=1");
  }
  if (source.statusClause) whereParts.push(source.statusClause);
  const where = whereParts.join(" AND ");

  const outFields =
    [source.combinedField, source.sciField, source.commonField, source.condField, source.sizeField, ...(source.extraFields || [])]
      .filter(Boolean)
      .join(",") || "*";

  const countRes = await fetch(
    `${source.base}/query?` +
      new URLSearchParams({
        where,
        returnCountOnly: "true",
        f: "json",
      }),
  );
  const countJson = await countRes.json();
  if (countJson.error)
    throw new Error(`ArcGIS error: ${JSON.stringify(countJson.error)}`);
  const count = countJson.count ?? 0;
  if (count === 0) return [];

  const offsets = Array.from(
    { length: Math.ceil(count / PAGE_SIZE) },
    (_, i) => i * PAGE_SIZE,
  );
  const pages = await Promise.all(
    offsets.map((offset) =>
      fetch(
        `${source.base}/query?` +
          new URLSearchParams({
            where,
            outFields,
            outSR: "4326",
            f: "geojson",
            resultOffset: offset,
            resultRecordCount: PAGE_SIZE,
            returnGeometry: "true",
          }),
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.error)
            throw new Error(`ArcGIS page error: ${JSON.stringify(d.error)}`);
          return d.features ?? [];
        }),
    ),
  );

  return pages.flat().map((f) => {
    const p = f.properties || {};

    let sci = "";
    let com = "";

    if (source.parseSpecies) {
      const extracted = source.parseSpecies(p);
      sci = (extracted.sci || "").trim();
      com = (extracted.com || "").trim();
    } else if (source.combinedField && source.extractSpecies) {
      const val = p[source.combinedField] || "";
      const extracted = source.extractSpecies(val, p);
      sci = (extracted.sci || "").trim();
      com = (extracted.com || "").trim();
    } else {
      sci = ((source.sciField && p[source.sciField]) || "").trim();
      com = ((source.commonField && p[source.commonField]) || "").trim();
    }

    const cond = ((source.condField && p[source.condField]) || "").trim();
    const sizeVal = source.sizeField ? p[source.sizeField] : null;
    const size = typeof sizeVal === "number" ? sizeVal : parseFloat(sizeVal);


    return {
      ...f,
      properties: {
        _scientific: sci,
        _common: com || sci || "Unknown",
        _condition: cond,
        _size: isNaN(size) ? null : size,
        _source: source.label,
        _base: source.base,
        _color: source.color,
        _is_cherry: isFloweringCherry(com, sci),
        _flower_color: getFlowerColor(sci),
        _blooming: getBloomingPeriod(sci),
      },
    };
  });
}
