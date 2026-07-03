function getDominantHighwayType(segments) {
    const counts = { primary: 0, secondary: 0, tertiary: 0 };
    for (const seg of segments) {
        if (seg.highway?.includes('primary')) counts.primary++;
        else if (seg.highway?.includes('tertiary')) counts.tertiary++;
        else counts.secondary++;
    }
    if (counts.primary >= counts.secondary && counts.primary >= counts.tertiary) return 'primary';
    if (counts.tertiary >= counts.secondary && counts.tertiary >= counts.primary) return 'tertiary';
    return 'secondary';
}

const BETA = 3;

export function calculeazaIndiciiDrumuri(drumuriProcesate, input, highwayWeights, ptLanesAverages, replacementIndex) {
    const rezultate = [];

    for (const drum of drumuriProcesate) {
        const dominantType = getDominantHighwayType(drum.segments);

        let totalTimeIdeal = 0;
        let totalTimeCalculated = 0;

        for (const segment of drum.segments) {
            const { lanes_total, lanes_new, length, highway, sum_pt_lanes } = segment;

            if (!length || length <= 0) continue;

            const freeFlowSpeed = Math.max(drum.speed_limit ?? 0, drum.speed_value ?? 0);
            const timeIdeal = freeFlowSpeed > 0 ? length / freeFlowSpeed : 0;
            totalTimeIdeal += timeIdeal;

            const currentSpeed = drum.speed_value;
            let predictedSpeed = currentSpeed;

            if (lanes_total > 0 && currentSpeed > 0) {
                const typeAverage = ptLanesAverages[dominantType] || 1;
                const normalizedPtFactor = typeAverage > 0
                    ? (sum_pt_lanes ?? 0) / typeAverage
                    : 0;

                const localReplacementIndex = Math.min(
                    1,
                    replacementIndex * 2 * (1 + 2 * normalizedPtFactor)
                );

                const demandRatio = Math.max(0, 1 - localReplacementIndex);
                const capacityRatio = lanes_new / lanes_total;

                const strainRatio = capacityRatio > 0
                    ? demandRatio / capacityRatio
                    : Infinity;

                if (strainRatio > 1 && Number.isFinite(strainRatio)) {
                    predictedSpeed = currentSpeed / Math.pow(strainRatio, BETA);
                } else if (strainRatio < 1 && Number.isFinite(strainRatio)) {
                    const improvedSpeed = currentSpeed / Math.pow(strainRatio, 1/BETA);
                    predictedSpeed = Math.min(improvedSpeed, freeFlowSpeed);
                } else if (Number.isFinite(strainRatio)) {
                    predictedSpeed = currentSpeed;
                } else {
                    predictedSpeed = 0.1;
                }
            }
            

            const timeCalculated = predictedSpeed > 0 ? length / predictedSpeed : timeIdeal * 10;
            totalTimeCalculated += timeCalculated;
        }

        const roadCongestion = totalTimeIdeal > 0
            ? (totalTimeCalculated - totalTimeIdeal) / totalTimeIdeal
            : 0;

        rezultate.push({
            id_road: drum.id_road,
            road_name: drum.road_name,
            dominant_type: dominantType,
            highway_weight: highwayWeights[dominantType],
            time_ideal: parseFloat(totalTimeIdeal.toFixed(4)),
            time_calculated: parseFloat(totalTimeCalculated.toFixed(4)),
            time_idx: parseFloat(roadCongestion.toFixed(4)),
        });
    }

    return rezultate;
}