import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapDisplay = ({ latitude, longitude, latitudeDelta, longitudeDelta }) => {
  return (
    <View style={styles.webMapPlaceholder}>
      <Text style={styles.webMapText}>📍 Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
      <Text style={styles.webMapSubText}>(Map view is available on the mobile app)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  webMapPlaceholder: {
    height: 150,
    width: '100%',
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9A84C',
    marginBottom: 15
  },
  webMapText: {
    color: '#C9A84C',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  webMapSubText: {
    color: '#F4F7FA',
    fontSize: 10
  }
});

export default MapDisplay;
