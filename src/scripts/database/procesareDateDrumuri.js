export function proceseazaDateDrumuri(detalii, input) {
    const {
        streetList = [],
        timeSetTag = 'morning_rush',
        method = 'harmonic_average_speed',
        replacementIndex = 2.27
    } = input;

    const rezultat = [];

    for (const drum of detalii) {
        let valoareViteza = null;

        const vitezaFolosita = drum.speed_details?.find(
            s => s.time_set_tag === timeSetTag
        );

        if (vitezaFolosita) {
            valoareViteza = parseFloat(vitezaFolosita[method]) || null;
        }
        const segmenteProcesate = drum.segments.map(segment => {
            const lanes_total = segment.lanes_total ?? 0;
            let lanes_new = lanes_total;
            let pt_lanes_idx=1;
            
            if (streetList.length > 0 && streetList.includes(drum.id_road)) {
                const scadere = segment.oneway ? 1 : 2;
                lanes_new = Math.max(1, lanes_total - scadere);
                const sum_pt_lanes = parseInt(segment.sum_pt_lanes ?? 0);
                if(lanes_total-scadere<1)
                    pt_lanes_idx = parseFloat(((100-sum_pt_lanes/3)/100).toFixed(2))
                pt_lanes_idx = parseFloat(((100-sum_pt_lanes)/100).toFixed(2))
            }
            return {
                lanes_total,
                lanes_new,
                highway: segment.highway,
                pt_lanes_idx: pt_lanes_idx,
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
