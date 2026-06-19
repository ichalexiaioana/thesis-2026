import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../../../server.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = (file) => path.join(__dirname, '../../../data/json', file);

const insertRoadsTomTom = async () => {
  const data = JSON.parse(fs.readFileSync(dataPath('ROADS_TOMTOM.json'), 'utf-8'));
  const features = data.features || [];
  let inserted = 0;

  for (const feature of features) {
    try {
      await prisma.roads_tomtom.create({
        data: {
          id_tomtom: feature.id_tomtom,
          street_name: feature.streetName,
          speed_limit: parseInt(feature.speedLimit) || null,
        },
      });
      inserted++;
    } catch (err) {
      console.error('roads_tomtom error:', err.message);
    }
  }
  console.log(`roads_tomtom: inserted ${inserted}/${features.length}`);
};

const insertRoads = async () => {
  const data = JSON.parse(fs.readFileSync(dataPath('ROADS.json'), 'utf-8'));
  const features = data.features || [];
  let inserted = 0;

  for (const feature of features) {
    try {
      await prisma.roads.create({
        data: {
          id_road: feature.id_road,
          id_tomtom: feature.id_tomtom,
          street_name_overpass: feature.name_overpass,
          street_name_tomtom: feature.name_tomtom,
        },
      });
      inserted++;
    } catch (err) {
      console.error('roads error:', err.message);
    }
  }
  console.log(`roads: inserted ${inserted}/${features.length}`);
};

const insertRoadsSegments = async () => {
  const data = JSON.parse(fs.readFileSync(dataPath('ROADS_SEGMENTS.json'), 'utf-8'));
  const features = data.features || [];
  let inserted = 0;

  for (const feature of features) {
    try {
      await prisma.roads_segments.create({
        data: {
          id_segment: feature.id_segment,
          id_road: feature.id_road,
          highway: feature.properties.highway,
          street_name: feature.name,
          lanes_total: feature.properties.lanes || null,
          lanes_forward: feature.properties['lanes:forward'] || null,
          lanes_backward: feature.properties['lanes:backward'] || null,
          lanes_bus_forward: feature.properties['lanes:bus:forward'] || null,
          lanes_bus_backward: feature.properties['lanes:bus:backward'] || null,
          oneway: feature.properties.oneway,
          length: feature.length,
          facing: feature.facing,
        },
      });
      inserted++;
    } catch (err) {
      console.error('roads_segments error:', err.message, feature.id_road);
    }
  }
  console.log(`roads_segments: inserted ${inserted}/${features.length}`);
};

const insertStations = async () => {
  const data = JSON.parse(fs.readFileSync(dataPath('STATIONS.json'), 'utf-8'));
  const features = data.features || [];
  let inserted = 0;

  for (const feature of features) {
    try {
      await prisma.stations.create({
        data: {
          id_station: feature.id_station,
          id_segment: feature.id_segment,
          station_name: feature.name,
          pt_lanes: feature.properties.nr_ref || null,
        },
      });
      inserted++;
    } catch (err) {
      console.error('stations error:', err.message, feature.id_station);
    }
  }
  console.log(`stations: inserted ${inserted}/${features.length}`);
};

const insertSpeedTomTom = async () => {
  const data = JSON.parse(fs.readFileSync(dataPath('SPEED_TOMTOM.json'), 'utf-8'));
  const features = data.features || [];
  let inserted = 0;

  for (const feature of features) {
    try {
      await prisma.speed_tomtom.create({
        data: {
          id_speed: uuidv4(),
          id_tomtom: feature.id_tomtom,
          time_set: feature.timeSet,
          time_set_tag: feature.timeSetTag,
          harmonic_avg_speed: feature.harmonicAverageSpeed,
          median_speed: feature.medianSpeed,
          avg_speed: feature.averageSpeed,
        },
      });
      inserted++;
    } catch (err) {
      console.error('speed_tomtom error:', err.message);
    }
  }
  console.log(`speed_tomtom: inserted ${inserted}/${features.length}`);
};


const run = async () => {
  await insertRoadsTomTom();
  await insertRoads();
  await insertRoadsSegments();
  await insertStations();
  await insertSpeedTomTom();
  await prisma.$disconnect();
};

run();