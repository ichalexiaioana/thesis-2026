export function calculeazaCongestie(indiciDrumuri) {
    let weightedSum = 0;
    let weightTotal = 0;

    indiciDrumuri.forEach(indici => {
        weightedSum += indici.time_idx * indici.highway_weight;
        weightTotal += indici.highway_weight;
    });
    console.log("AA", weightTotal, weightedSum)

    const congestie = weightTotal > 0 ? weightedSum / weightTotal : 0;
    return parseFloat(congestie.toFixed(4));
}