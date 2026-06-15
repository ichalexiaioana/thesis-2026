export function calculeazaIndiciiDrumuri(drumuriProcesate, input) {
    const rezultate = [];

    for (const drum of drumuriProcesate) {
        let distanceIdx = 0;
        let distanceSum = 0;

        for (const segment of drum.segments) {
            const { lanes_total, lanes_new, length, pt_lanes_idx, highway} = segment;
            let highway_idx = 2.2;
            if(highway.includes('primary'))
                highway_idx = 2.6;
            if(highway.includes('secondary'))
                highway_idx = 2.2;
            if(highway.includes('tertiary'))
                highway_idx = 1.8;

            distanceIdx += (lanes_new * length * highway_idx)/(lanes_total * pt_lanes_idx)
            distanceSum += length;
        }

        const speedIdx = ( drum.speed_limit - drum.speed_value) / drum.speed_limit;
        
        rezultate.push({
            id_road: drum.id_road,
            road_name: drum.road_name,
            distance_idx: parseFloat((distanceIdx/distanceSum).toFixed(2)),
            speed_idx: parseFloat(speedIdx.toFixed(2)),
            time_idx: parseFloat((distanceIdx*speedIdx/distanceSum).toFixed(2)),
        });
    }

    return rezultate;
}
