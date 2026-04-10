import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

const MapDisplay = ({ latitude, longitude, latitudeDelta, longitudeDelta }) => {
  return (
    <MapView
      style={styles.mapSmall}
      initialRegion={{
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: latitudeDelta || 0.01,
        longitudeDelta: longitudeDelta || 0.01,
      }}
    >
      <Marker coordinate={{ latitude: latitude, longitude: longitude }} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  mapSmall: { flex: 1 },
});

export default MapDisplay;
