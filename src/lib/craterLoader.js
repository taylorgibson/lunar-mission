import { FALLBACK_CRATERS, CD_MIN } from './constants.js';

export async function loadCraters() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data.csv`);
    const text = await response.text();
    const lines = text.trim().split('\n');
    const craters = [];

    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/"([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
      if (!match) continue;
      const [, name, lat, lon, diameter] = match;
      const d = parseFloat(diameter);
      if (d >= CD_MIN) {
        craters.push({
          name,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          diameter: d
        });
      }
      if (craters.length >= 21) break;
    }

    craters.sort((a, b) => a.name.localeCompare(b.name));
    return craters.slice(0, 21);
  } catch (e) {
    console.warn('Failed to load crater CSV, using fallback:', e);
    return [...FALLBACK_CRATERS];
  }
}
