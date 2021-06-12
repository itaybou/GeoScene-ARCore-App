import * as Geofire from './Geofire';

import { Triangulation } from '../Firestore';

const MAX_QUERY_RADIUS_M = 1e5;
const MIN_QUERY_RADIUS_M = 1e2;

export const addTriangulationRecord = async (
  username: string,
  name: string,
  description: string,
  coordinate: { latitude: number; longitude: number },
  azimuth: number,
) => {
  try {
    const geohash = Geofire.geohashForLocation([
      coordinate.latitude,
      coordinate.longitude,
    ]);

    await Triangulation.add({
      username,
      name,
      description,
      azimuth,
      coordinate,
      geohash,
      timestamp: Math.floor(Date.now() / 1000),
    });

    return true;
  } catch (ex) {
    return false;
  }
};

export const getTriangulationRecords = async (coordinate: {
  latitude: number;
  longitude: number;
}) => {
  try {
    const bounds = Geofire.geohashQueryBounds(
      [coordinate.latitude, coordinate.longitude],
      MAX_QUERY_RADIUS_M,
    );

    const promises = [];
    for (const bound of bounds) {
      const query = Triangulation.orderBy('geohash')
        .startAt(bound[0])
        .endAt(bound[1]);
      promises.push(query.get());
    }

    const snapshots = await Promise.all(promises);
    const matchingDocs = [];

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const lat = doc.get('coordinate.latitude') as number;
        const lng = doc.get('coordinate.longitude') as number;

        // We have to filter out a few false positives due to GeoHash
        // accuracy, but most will match
        const distanceInKm = Geofire.distanceBetween(
          [lat, lng],
          [coordinate.latitude, coordinate.longitude],
        );
        const distanceInM = distanceInKm * 1000;
        if (
          distanceInM <= MAX_QUERY_RADIUS_M &&
          distanceInM >= MIN_QUERY_RADIUS_M
        ) {
          matchingDocs.push({ id: doc.id, ...doc.data() });
        }
      }
    }
    return matchingDocs;
  } catch (ex) {
    return null;
  }
};

export const deleteTriangulationRecord = async (id: string) => {
  try {
    await Triangulation.doc(id).delete();
  } catch (ex) {
    console.error(ex);
  }
};
