import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../../../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../../../data/ins/date_ins_adj.csv');

const insertAdjStats = async () => {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const lines = raw.trim().split('\n');
  const rows = lines.slice(1).map(line => {
    const [an, nr_rezidenti, masini_total, masini_total_adj, vanzari_stb, vanzari_stb_adj] = line.split(',');
    return {
      an: parseInt(an),
      nr_rezidenti: parseInt(nr_rezidenti),
      masini_total: parseInt(masini_total),
      masini_total_adj: parseInt(masini_total_adj),
      vanzari_stb: parseFloat(vanzari_stb),
      vanzari_stb_adj: parseFloat(vanzari_stb_adj),
    };
  });

  let inserted = 0;

  for (const row of rows) {
    try {
      await prisma.adj_stats.create({ data: row });
      inserted++;
    } catch (err) {
      console.error(`Error inserting year ${row.an}:`, err.message);
    }
  }

  console.log(`adj_stats: inserted ${inserted}/${rows.length}`);
  await prisma.$disconnect();
};

insertAdjStats();