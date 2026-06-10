import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

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

app.get('/ping', (req, res) => {
  res.json({ message: 'Server is running' });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});