import { prisma } from '../../../server.js';
import osmtogeojson from 'osmtogeojson';
import { overpassQuery } from '../../constants.js';
import { OVERPASS_URL } from '../../constants.js';

const DELAY_MS = 2000;

async function fetchOverpassWithRetry(road, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(OVERPASS_URL, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 
          'User-Agent': 'PAWS (mydomain.de)',  
          'Referer': 'http://www.mydomain.de/' 
        },
        body: overpassQuery(road.street_name_overpass),
    });

    if (res.ok) return res;
    

    if (res.status === 429 || res.status === 504) {
      const waitTime = (attempt + 1) * 5000;
      console.warn(`  Got ${res.status}, retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    return res; // some other error, don't retry
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

 export async function cacheGeometry() {
  const roads = await prisma.roads.findMany({
    select: { id_road: true, street_name_overpass: true },
  });

  console.log(`Found ${roads.length} roads needing geometry.`);

  let success = 0;
  let failed = 0;

  for (const [index, road] of roads.entries()) {
    if (!road.street_name_overpass) {
      console.log(`[${index + 1}/${roads.length}] Skipping ${road.id_road} - no street name`);
      continue;
    }

    console.log(`[${index + 1}/${roads.length}] Fetching: ${road.street_name_overpass}`);

    try {
      const res = await fetchOverpassWithRetry(road);

      if (!res.ok) {
        console.warn(`  Failed with status ${res.status}, skipping.`);
        failed++;
        continue;
      }

      const osmData = await res.json();
      const geojson = osmtogeojson(osmData);

      await prisma.roads.update({
        where: { id_road: road.id_road },
        data: { geometry: geojson },
      });

      success++;
      console.log(`  Saved (${geojson.features.length} features)`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
      failed++;
    }
    

    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  await prisma.$disconnect();
}

cacheGeometry();