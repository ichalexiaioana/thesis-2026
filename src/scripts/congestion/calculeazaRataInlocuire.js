import { prisma } from '../../../server.js';

export async function calculeazaShifturiMedii(startYear = 2013) {
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

  const avgShiftMasini = difMasini.reduce((sum, val) => sum + val, 0) / difMasini.length;
  const avgShiftVanzari = difVanzari.reduce((sum, val) => sum + val, 0) / difVanzari.length;

  const result = {
    total: {
      masini: avgShiftMasini.toFixed(2),
      vanzari: avgShiftVanzari.toFixed(2),
      diferenta: (avgShiftVanzari - avgShiftMasini).toFixed(2)
    }
  };

  const startIndex = ani.findIndex(an => an === parseInt(startYear));
  if (startIndex > 1) {
    const filteredDiffMasini = difMasini.slice(startIndex - 1);
    const filteredDiffVanzari = difVanzari.slice(startIndex - 1);
    const avgShiftMasiniYear = filteredDiffMasini.reduce((sum, val) => sum + val, 0) / filteredDiffMasini.length;
    const avgShiftVanzariYear = filteredDiffVanzari.reduce((sum, val) => sum + val, 0) / filteredDiffVanzari.length;

    result.partial = {
      masini: avgShiftMasiniYear.toFixed(2),
      vanzari: avgShiftVanzariYear.toFixed(2),
      diferenta: (avgShiftVanzariYear - avgShiftMasiniYear).toFixed(2)
    };
  }

  return result;
}