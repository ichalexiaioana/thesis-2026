import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../../../data/ins/date_ins_adj.csv');
const outputPath = path.join(__dirname, '../../../data/ins/date_ins_adj_2.csv');

const raw = fs.readFileSync(inputPath, 'utf-8');
const lines = raw.trim().split('\n');

const rows = lines.slice(1).map(line => {
  const [an, nr_rezidenti, masini_total, masini_total_adj, vanzari_stb, vanzari_stb_adj] = line.split(',');
  return {
    an: parseInt(an),
    nr_rezidenti: parseInt(nr_rezidenti),
    masini_total: parseInt(masini_total_adj),
    vanzari_stb: parseFloat(vanzari_stb_adj),
  };
});

//vanzari_stb
const trainingRows = rows.filter(r => r.an >= 2012 && r.an <= 2024);

const n = trainingRows.length;
const sumX = trainingRows.reduce((s, r) => s + r.an, 0);
const sumY = trainingRows.reduce((s, r) => s + r.vanzari_stb, 0);
const sumXY = trainingRows.reduce((s, r) => s + r.an * r.vanzari_stb, 0);
const sumX2 = trainingRows.reduce((s, r) => s + r.an * r.an, 0);

const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;

const predict = (year) => slope * year + intercept;

console.log(`Regression: y = ${slope.toFixed(2)} * year + ${intercept.toFixed(2)}`);
console.log(`Predicted 2025: ${predict(2025).toFixed(2)}`);
console.log(`Predicted 2026: ${predict(2026).toFixed(2)}`);
console.log(`Predicted 2027: ${predict(2027).toFixed(2)}`);
console.log(`Predicted 2028: ${predict(2028).toFixed(2)}`);
console.log(`Predicted 2029: ${predict(2029).toFixed(2)}`);
console.log(`Predicted 2030: ${predict(2030).toFixed(2)}`);

//masini_total
const sumY2 = trainingRows.reduce((s, r) => s + r.masini_total, 0);
const sumXY2 = trainingRows.reduce((s, r) => s + r.an * r.masini_total, 0);

const slope2 = (n * sumXY2 - sumX * sumY2) / (n * sumX2 - sumX * sumX);
const intercept2 = (sumY2 - slope2 * sumX) / n;

const predictMasini = (year) => slope2 * year + intercept2;

console.log(`Masini regression: y = ${slope2.toFixed(2)} * year + ${intercept2.toFixed(2)}`);
console.log(`Predicted masini 2025: ${predictMasini(2025).toFixed(2)}`);
console.log(`Predicted masini 2026: ${predictMasini(2026).toFixed(2)}`);
console.log(`Predicted masini 2027: ${predictMasini(2027).toFixed(2)}`);
console.log(`Predicted masini 2028: ${predictMasini(2028).toFixed(2)}`);
console.log(`Predicted masini 2029: ${predictMasini(2029).toFixed(2)}`);
console.log(`Predicted masini 2030: ${predictMasini(2030).toFixed(2)}`);

// const header = 'an,nr_rezidenti,masini_total,masini_total_adj,vanzari_stb,vanzari_stb_adj';
// const outputRows = rows.map(r => {
//   const adjVanzari = (r.an === 2020 || r.an === 2021)
//     ? predict(r.an).toFixed(2)
//     : r.vanzari_stb.toFixed(2);
//   const adjMasini = (r.an === 2020 || r.an === 2021)
//     ? Math.round(predictMasini(r.an))
//     : r.masini_total;
//   return `${r.an},${r.nr_rezidenti},${r.masini_total},${adjMasini},${r.vanzari_stb},${adjVanzari}`;
// });

// const output = [header, ...outputRows].join('\n');
// fs.writeFileSync(outputPath, output);
// console.log(`Saved to ${outputPath}`);