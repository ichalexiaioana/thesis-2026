import { prisma } from '../../../server.js';

export async function detaliiCompleteDrumuri() {
  try {
    const roads = await prisma.roads.findMany({
      select: {
        id_road: true,
        street_name_overpass: true,
        id_tomtom: true,
        roads_segments: {
          select: {
            id_segment: true,
            highway: true,
            lanes_total: true,
            lanes_forward: true,
            lanes_backward: true,
            oneway: true,
            length: true,
            stations: {
              select: {
                pt_lanes: true,
              }
            }
          }
        },
        roads_tomtom: {
          select: {
            speed_limit: true,
            speed_tomtom: true,
          }
        }
      }
    });

    return roads.map(road => {
      const segments = road.roads_segments.map(segment => {
        const sum_pt_lanes = segment.stations.reduce((sum, s) => {
          const val = parseInt(s.pt_lanes);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        return {
          ...segment,
          length: parseFloat(segment.length),
          sum_pt_lanes,
        };
      });

      return {
        id_road: road.id_road,
        road_name: road.street_name_overpass,
        speed_limit: road.roads_tomtom?.speed_limit ? parseInt(road.roads_tomtom.speed_limit) : null,
        speed_details: road.roads_tomtom?.speed_tomtom ?? [],
        segments,
      };
    });
  } catch (err) {
    console.error('Eroare la detaliiCompleteDrumuri:', err.message);
    throw err;
  }
}