import { calculeazaShifturiMedii } from '../congestion/calculeazaRataInlocuire.js';

export async function calculeazaCongestie(indiciDrumuri, input) {
  let congestie = 0;
  indiciDrumuri.forEach(indici => {
    congestie += indici.time_idx;
  });

  const avgShift = await calculeazaShifturiMedii(input.startYear);
  const avgShiftVal = avgShift?.partial?.diferenta
    ? avgShift.partial.diferenta
    : avgShift.total.diferenta;

  const replacementIndex = (100 - avgShiftVal) / 100;
  return parseFloat((congestie * replacementIndex / indiciDrumuri.length).toFixed(4));
}