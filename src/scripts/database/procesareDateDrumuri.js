export function proceseazaDateDrumuri(detalii, input) {
    const {
        streetList = [],
        timeSetTag = 'morning_rush',
        method = 'harmonic_average_speed',
        replacementIndex = 0.0138
    } = input;

    const rezultat = [];

    for (const drum of detalii) {
        const vitezaFolosita = drum.speed_details?.find(
            s => s.time_set_tag === timeSetTag
        );

        let valoareViteza = null;
        if (vitezaFolosita) {
            valoareViteza = parseFloat(vitezaFolosita[method]) || null;
        }

        if (!valoareViteza || valoareViteza <= 0) {
            valoareViteza = drum.speed_limit && drum.speed_limit > 0 ? drum.speed_limit : 30;
        }

        const segmenteProcesate = drum.segments.map(segment => {
            const lanes_total = segment.lanes_total ?? 0;
            let lanes_new = lanes_total;
            const sum_pt_lanes = parseInt(segment.sum_pt_lanes ?? 0);
            
            if (streetList.length > 0 && streetList.includes(drum.id_road)) {
                const scadere = segment.oneway ? 1 : 2;
                lanes_new = Math.max(1, lanes_total - scadere);
            }
            return {
                lanes_total,
                lanes_new,
                highway: segment.highway,
                sum_pt_lanes: sum_pt_lanes,
                length: parseFloat(segment.length ?? 0)
            };
        });
        rezultat.push({
            id_road: drum.id_road,
            road_name: drum.road_name,
            speed_limit: drum.speed_limit,
            selected_method: method,
            time_set_tag: timeSetTag,
            speed_value: valoareViteza,
            segments: segmenteProcesate
        });
    }

    return rezultat;
}
