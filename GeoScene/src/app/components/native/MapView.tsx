import React, { useMemo, useRef } from 'react';
import { StyleSheet, UIManager, findNodeHandle } from 'react-native';

import { NativeMapView } from '../../../native/NativeViewsBridge';

type MapActionTypes = 'bbox' | null;

interface MapViewProps {
  mapSingleTapAction?: { action: MapActionTypes; args: any };
  afterMapSingleTap: (event: any) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  mapSingleTapAction,
  afterMapSingleTap,
}) => {
  const mapRef = useRef<number | null>(null);
  const MapsManager = useMemo(
    () => UIManager.getViewManagerConfig('MapView'),
    [],
  );

  const mapActions = (event: { nativeEvent: any }) => {
    switch (mapSingleTapAction?.action) {
      case 'bbox':
        const locationMarker = event.nativeEvent;
        UIManager.dispatchViewManagerCommand(
          mapRef.current,
          MapsManager.Commands.SET_BBOX.toString(),
          mapSingleTapAction.args, // map referece, use compass orientation, use observe location
        );
        return {
          longitude: locationMarker.longitude,
          latitude: locationMarker.latitude,
        };
      default:
        break;
    }
  };

  return (
    <NativeMapView
      style={styles.container}
      enableLocationTap={true}
      useObserverLocation={false}
      enableZoom={true}
      onMapSingleTap={(event: { nativeEvent: any }) =>
        mapSingleTapAction && afterMapSingleTap(mapActions(event))
      }
      ref={(
        nativeRef:
          | number
          | React.ComponentClass<any, any>
          | React.Component<any, any, any>
          | null,
      ) => (mapRef.current = findNodeHandle(nativeRef))}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
});
