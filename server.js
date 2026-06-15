import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';
import osmtogeojson from 'osmtogeojson';

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

app.listen(3000, () => {
  console.log('server ok');
});

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

  res.json({ congestie: 0.1234 });
});