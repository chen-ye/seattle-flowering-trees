import { SOURCES } from './src/constants.js';

async function checkDomains() {
  const prunusList = new Set();
  const rawList = [];

  for (const ds of SOURCES) {
    console.log(`Checking ${ds.label}...`);
    try {
      const url = `${ds.base}?f=json`;
      const res = await fetch(url);
      const data = await res.json();

      const fields = data.fields || [];
      for (const field of fields) {
        if (field.domain && field.domain.codedValues) {
          for (const cv of field.domain.codedValues) {
            const name = cv.name || '';
            const code = cv.code || '';
            if (name.toUpperCase().includes('PRUNUS') || String(code).toUpperCase().includes('PRUNUS')) {
              prunusList.add(`${name} | ${code}`);
              rawList.push({ name, code, ds: ds.label });
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching ${ds.label}:`, e);
    }
  }

  console.log("All Prunus varieties found in domains:");
  const sorted = Array.from(prunusList).sort();
  for (const p of sorted) {
    console.log(p);
  }

  import('fs').then(fs => {
    fs.writeFileSync('prunus.json', JSON.stringify(rawList, null, 2));
  });
}

checkDomains();
