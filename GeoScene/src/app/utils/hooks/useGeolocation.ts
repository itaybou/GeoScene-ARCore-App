/* eslint-disable react-hooks/exhaustive-deps */
import Geolocation, { GeoError } from 'react-native-geolocation-service';
import { useEffect, useState } from 'react';

type Accuracy = 'high' | 'balanced' | 'low' | 'passive';

export interface PositionOptions {
  accuracy?: Accuracy;
  enableHighAccuracy?: boolean;
  distanceFilter?: number; // meter
  interval?: number; // ms
  fastestInterval?: number;
  showLocationDialog?: boolean;
  forceRequestLocation?: boolean;
}

export interface GeoLocationSensorState {
  loading: boolean;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  error?: Error | GeoError | null;
}

export const accurateOptions = Object.freeze({
  accuracy: 'high' as Accuracy,
  enableHighAccuracy: true,
  interval: 10,
  fastestInterval: 5,
  distanceFilter: 0,
});

const initialState = {
  loading: true,
  accuracy: null,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  latitude: null,
  longitude: null,
  speed: null,
  timestamp: Date.now(),
};

const useGeolocation = (): GeoLocationSensorState => {
  const [state, setState] = useState<GeoLocationSensorState>(initialState);
  let mounted = true;
  let watchId: any;

  const onEvent = (event: any) => {
    if (mounted) {
      setState({
        loading: false,
        accuracy: event.coords.accuracy,
        altitude: event.coords.altitude,
        altitudeAccuracy: event.coords.altitudeAccuracy,
        heading: event.coords.heading,
        latitude: event.coords.latitude,
        longitude: event.coords.longitude,
        speed: event.coords.speed,
        timestamp: event.timestamp,
        error: null,
      });
    }
  };
  const onEventError = (error: GeoError) =>
    mounted && setState((oldState) => ({ ...oldState, loading: false, error }));

  useEffect(() => {
    Geolocation.getCurrentPosition(onEvent, onEventError, accurateOptions);
    watchId = Geolocation.watchPosition(onEvent, onEventError, accurateOptions);

    return () => {
      mounted = false;
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
};

export default useGeolocation;
