import { prisma } from '../../../server.js';

export async function calculeazaShifturiMedii(startYear = 2013, endYear = 2026) {
  const records = await prisma.adj_stats.findMany({
    orderBy: { an: 'asc' }
  });

  const masiniPeRezident = [];
  const vanzariPeRezident = [];
  const ani = [];

  for (const row of records) {
    const rezidenti = row.nr_rezidenti;
    const masini = row.masini_total_adj;
    const vanzari = parseFloat(row.vanzari_stb_adj);

    if (rezidenti && masini && vanzari) {
      ani.push(row.an);
      masiniPeRezident.push(masini / rezidenti);
      vanzariPeRezident.push(vanzari / rezidenti);
    }
  }

  const calcDifProcent = (arr) => {
    const difs = [];
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1];
      const curr = arr[i];
      const delta = (curr - prev) / prev;
      difs.push(delta * 100);
    }
    return difs;
  };

  const difMasini = calcDifProcent(masiniPeRezident);
  const difVanzari = calcDifProcent(vanzariPeRezident);
  const diffYears = ani.slice(1);

  // --- Original fallback structure (total / partial averages) ---
  const avgShiftMasini = difMasini.reduce((sum, val) => sum + val, 0) / difMasini.length;
  const avgShiftVanzari = difVanzari.reduce((sum, val) => sum + val, 0) / difVanzari.length;

  const result = {
    total: {
      masini: avgShiftMasini.toFixed(2),
      vanzari: avgShiftVanzari.toFixed(2),
      diferenta: (avgShiftVanzari - avgShiftMasini).toFixed(2)
    }
  };

  // --- New regression-based prediction, for every year from startYear to endYear ---
  function linearRegression(years, values) {
    const n = years.length;
    if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };

    const sumX = years.reduce((s, y) => s + y, 0);
    const sumY = values.reduce((s, v) => s + v, 0);
    const sumXY = years.reduce((s, y, i) => s + y * values[i], 0);
    const sumX2 = years.reduce((s, y) => s + y * y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  try {
    const startIdx = diffYears.findIndex(y => y >= parseInt(startYear));
    const filteredYears = startIdx >= 0 ? diffYears.slice(startIdx) : diffYears;
    const filteredMasini = startIdx >= 0 ? difMasini.slice(startIdx) : difMasini;
    const filteredVanzari = startIdx >= 0 ? difVanzari.slice(startIdx) : difVanzari;

    if (filteredYears.length < 2) {
      throw new Error('Not enough data points for regression');
    }

    const masiniTrend = linearRegression(filteredYears, filteredMasini);
    const vanzariTrend = linearRegression(filteredYears, filteredVanzari);

    const predict = (trend, year) => trend.slope * year + trend.intercept;

    const yearlyPredictions = [];
    const masiniAccumulate = [];
    const vanzariAccumulate = [];
    const diferenteAccumulate = [];

    for (let year = parseInt(startYear); year <= endYear; year++) {
      let predictedMasini, predictedVanzari;

      const historicalIdx = diffYears.indexOf(year);
      if (historicalIdx !== -1) {
        predictedMasini = difMasini[historicalIdx];
        predictedVanzari = difVanzari[historicalIdx];
      } else {
        predictedMasini = predict(masiniTrend, year);
        predictedVanzari = predict(vanzariTrend, year);
      }

      const predictedDiferenta = predictedVanzari - predictedMasini;

      masiniAccumulate.push(predictedMasini);
      vanzariAccumulate.push(predictedVanzari);
      diferenteAccumulate.push(predictedDiferenta);

      const runningAvgMasini = masiniAccumulate.reduce((sum, v) => sum + v, 0) / masiniAccumulate.length;
      const runningAvgVanzari = vanzariAccumulate.reduce((sum, v) => sum + v, 0) / vanzariAccumulate.length;
      const runningAvgDiferenta = diferenteAccumulate.reduce((sum, v) => sum + v, 0) / diferenteAccumulate.length;

      yearlyPredictions.push({
        year,
        predictedMasini: parseFloat(predictedMasini.toFixed(2)),
        predictedVanzari: parseFloat(predictedVanzari.toFixed(2)),
        predictedDiferenta: parseFloat(predictedDiferenta.toFixed(2)),
        runningAvgMasini: parseFloat(runningAvgMasini.toFixed(2)),
        runningAvgVanzari: parseFloat(runningAvgVanzari.toFixed(2)),
        runningAvgDiferenta: parseFloat(runningAvgDiferenta.toFixed(2)),
      });

      result.partial = {
        masini: runningAvgMasini.toFixed(2),
        vanzari: runningAvgVanzari.toFixed(2),
        diferenta: runningAvgDiferenta.toFixed(2),
      };
    }

    const avgPredictedDiferenta = diferenteAccumulate.reduce((sum, v) => sum + v, 0) / diferenteAccumulate.length;

  } catch (err) {
    console.error('Prediction failed, falling back to total/partial averages:', err.message);
  }

  return result;
}