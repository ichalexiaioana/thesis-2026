import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';
import osmtogeojson from 'osmtogeojson';
import { detaliiCompleteDrumuri } from './src/scripts/database/detaliiCompleteDrumuri.js';
import { proceseazaDateDrumuri } from './src/scripts/database/procesareDateDrumuri.js';
import { calculeazaIndiciiDrumuri } from './src/scripts/database/calculeazaIndici.js';
import { calculeazaCongestie } from './src/scripts/database/calculeazaCongestie.js';
import { calculeazaShifturiMedii } from './src/scripts/congestion/calculeazaRataInlocuire.js';
import { API_URL } from './src/constants.js';

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());


export let highwayWeights = { primary: 0.37, secondary: 0.40, tertiary: 0.23 };
export let ptLanesAverages = { primary: 1.13, secondary: 0.9, tertiary: 0.6 };

const startServer = async () => {
  app.listen(3000, async () => {
    console.log('Server ok');
    try {
      const res = await fetch(`${API_URL}/highway-weights`);
      const data = await res.json();
      highwayWeights = { primary: data.primary, secondary: data.secondary, tertiary: data.tertiary };
      console.log('Highway weights loaded:', highwayWeights);

      const ptRes = await fetch(`${API_URL}/pt-lanes-by-type`);
      ptLanesAverages = await ptRes.json();
      console.log('Pt lanes avg: ', ptLanesAverages)
    } catch (err) {
      console.error(err.message);
    }
  });
};

startServer();

app.get('/api/roads', async (req, res) => {
  try {
    const roads = await prisma.roads.findMany({
      select: {
        id_road: true,
        street_name_overpass: true,
        street_name_tomtom: true,
        id_tomtom: true,
      }
    });
    res.json(roads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/map', async (req, res) => {
  try {
    const coords = osmtogeojson(req.body);
    res.json({ coords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/highway-weights', async (req, res) => {
  try {
    const segments = await prisma.roads_segments.findMany({
      select: { highway: true, lanes_total: true, length: true }
    });

    const laneKm = { primary: 0, secondary: 0, tertiary: 0 };

    for (const seg of segments) {
      const lanes = seg.lanes_total ?? 0;
      const length = seg.length ? parseFloat(seg.length) : 0;
      const contribution = lanes * length;

      if (seg.highway?.includes('primary')) laneKm.primary += contribution;
      else if (seg.highway?.includes('secondary')) laneKm.secondary += contribution;
      else if (seg.highway?.includes('tertiary')) laneKm.tertiary += contribution;
    }

    const total = laneKm.primary + laneKm.secondary + laneKm.tertiary;

    res.json({
      primary: laneKm.primary / total,
      secondary: laneKm.secondary / total,
      tertiary: laneKm.tertiary / total,
      raw: laneKm,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pt-lanes-by-type', async (req, res) => {
  try {
    const segments = await prisma.roads_segments.findMany({
      select: {
        highway: true,
        stations: {
          select: { pt_lanes: true }
        }
      }
    });
 
    const sums = { primary: [], secondary: [], tertiary: [] };
 
    for (const seg of segments) {
      const sumPtLanes = seg.stations.reduce((sum, s) => {
        const val = parseInt(s.pt_lanes);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
 
      let type = 'secondary';
      if (seg.highway?.includes('primary')) type = 'primary';
      else if (seg.highway?.includes('tertiary')) type = 'tertiary';
 
      sums[type].push(sumPtLanes);
    }
 
    const avg = arr => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
 
    res.json({
      primary: avg(sums.primary),
      secondary: avg(sums.secondary),
      tertiary: avg(sums.tertiary),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data', async (req, res) => {
  const { streetList, timeSetTag, method, startYear } = req.body;

  const validTimeSetTags = ['evening_rush', 'around_noon', 'morning_rush', 'rest_hours'];
  const validMethods = ['harmonic_avg_speed', 'median_speed', 'avg_speed'];
  const validStartYears = Array.from({ length: 2023 - 2013 + 1 }, (_, i) => (2013 + i).toString());

  if (!Array.isArray(streetList) || !streetList.every(s => typeof s === 'string'))
    return res.status(400).json({ error: 'streetList must be an array of strings' });
  if (!validTimeSetTags.includes(timeSetTag))
    return res.status(400).json({ error: 'invalid timeSetTag' });
  if (!validMethods.includes(method))
    return res.status(400).json({ error: 'invalid method' });
  if (!validStartYears.includes(startYear))
    return res.status(400).json({ error: 'invalid startYear' });

  try {
    const input = { streetList, timeSetTag, method, startYear };

    const avgShift = await calculeazaShifturiMedii(startYear);
    const avgShiftVal = parseFloat(avgShift?.partial?.diferenta ?? avgShift.total.diferenta);
    const replacementIndex = Math.max(0, avgShiftVal / 100);

    const detalii = await detaliiCompleteDrumuri();
    const procesat = proceseazaDateDrumuri(detalii, input);
    const indici = calculeazaIndiciiDrumuri(procesat, input, highwayWeights, ptLanesAverages, replacementIndex);
    const congestie = calculeazaCongestie(indici);

    res.json({ congestie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});