import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Share, Platform, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');
  const [route, setRoute] = useState<any | null>(null);




  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);


  useFocusEffect(
    useCallback(() => {
      const loadRoute = async () => {
        try {
          const storedRoute = await AsyncStorage.getItem("latestOptimizedRoute");
          if (storedRoute) {
            const parsed = JSON.parse(storedRoute);
            setRoute(null); // force reset first
            setTimeout(() => setRoute(parsed), 0);
            console.log("✅ Loaded stored route:", parsed.places[0].name);
          } else {
            setRoute(null);
            console.log("ℹ️ No stored route found");
          }
        } catch (err) {
          console.warn("❌ Failed to load stored route:", err);
        }
      };
      console.log('MapScreen is focused!');
      loadRoute();
    }, [])
  );

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (route?.places && route.places.length > 0 && mapRef.current) {
      const coords = route.places.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  }, [route]);


  // Layer selection handler
  const handleLayerPress = () => {
    const options = ['Standard', 'Satellite', 'Hybrid', 'Cancel'];
    const types = ['standard', 'satellite', 'hybrid'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex < 3) setMapType(types[buttonIndex] as typeof mapType);
        }
      );
    } else {
      Alert.alert(
        'Select Map Layer',
        '',
        [
          { text: 'Standard', onPress: () => setMapType('standard') },
          { text: 'Satellite', onPress: () => setMapType('satellite') },
          { text: 'Hybrid', onPress: () => setMapType('hybrid') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Settings handler (placeholder)
  const handleSettingsPress = () => {
    Alert.alert('Settings', 'Settings feature coming soon!');
  };

  // Share handler
  const handleSharePress = async () => {
    if (!route || !route.places || route.places.length === 0) {
      Alert.alert('Nothing to share', 'No route available.');
      return;
    }
    // Share Google Maps directions with waypoints
    const origin = `${route.places[0].latitude},${route.places[0].longitude}`;
    const destination = `${route.places[route.places.length - 1].latitude},${route.places[route.places.length - 1].longitude}`;
    const waypoints = route.places.slice(1, -1)
      .map(p => `${p.latitude},${p.longitude}`)
      .join('|');
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    url += '&travelmode=driving';

    try {
      await Share.share({
        message: `Open this route in Google Maps:\n${url}`,
        url,
        title: 'Share Route'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the route.');
    }
  };

  // Open in Google Maps handler
  const handleOpenInGoogleMaps = () => {
    if (!route || !route.places || route.places.length === 0) {
      Alert.alert('Nothing to open', 'No route available.');
      return;
    }
    const origin = `${route.places[0].latitude},${route.places[0].longitude}`;
    const destination = `${route.places[route.places.length - 1].latitude},${route.places[route.places.length - 1].longitude}`;
    const waypoints = route.places.slice(1, -1)
      .map(p => `${p.latitude},${p.longitude}`)
      .join('|');
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    url += '&travelmode=driving';

    Linking.openURL(url);
  };

  const isValidCoords =
    location &&
    location.coords &&
    typeof location.coords.latitude === 'number' &&
    typeof location.coords.longitude === 'number' &&
    !isNaN(location.coords.latitude) &&
    !isNaN(location.coords.longitude);

  const isValidRoute =
    route &&
    Array.isArray(route.places) &&
    route.places.length > 0 &&
    route.places.every(
      p =>
        typeof p.latitude === 'number' &&
        typeof p.longitude === 'number' &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude)
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Map</Text>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="locate" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {isValidCoords && isValidRoute ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: location?.coords?.latitude || 37.78825,
              longitude: location?.coords?.longitude || -122.4324,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* User marker */}
            <Marker
              coordinate={{
                latitude: location?.coords?.latitude,
                longitude: location?.coords?.longitude,
              }}
              title="You are here"
              pinColor="#10B981"
            />
            {/* Route markers */}

            {Array.isArray(route?.places) && route?.places?.map((p, i) => (
              <Marker
                key={`${p.id}_${i}`}
                coordinate={{
                  latitude: p?.latitude,
                  longitude: p?.longitude,
                }}
                title={p?.name}
                description={p?.category}
                pinColor="#3B82F6"
              />
            ))}
            {/* Polyline for route if available */}
            {route?.polyline && (() => {
              const points = decodePolyline(route.polyline).filter(
                p =>
                  typeof p.latitude === 'number' &&
                  typeof p.longitude === 'number' &&
                  !isNaN(p.latitude) &&
                  !isNaN(p.longitude)
              );
              return points.length > 1 ? (
                <Polyline
                  coordinates={points}
                  strokeColor="#3B82F6"
                  strokeWidth={4}
                />
              ) : null;
            })()}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={64} color="#D1D5DB" />
            <Text style={styles.mapPlaceholderTitle}>Loading map...</Text>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            {!isValidRoute && (
              <Text style={styles.errorText}>No valid route to display.</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleLayerPress}>
          <Ionicons name="layers" size={20} color="#6B7280" />
          <Text style={styles.controlButtonText}>Layers</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.controlButton} onPress={handleSettingsPress}>
          <Ionicons name="options" size={20} color="#6B7280" />
          <Text style={styles.controlButtonText}>Settings</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.controlButton} onPress={handleSharePress}>
          <Ionicons name="share" size={20} color="#6B7280" />
          <Text style={styles.controlButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...styles.controlButton, flexDirection: 'column' }} onPress={handleOpenInGoogleMaps}>
          <Ionicons name="map" size={20} color="#6B7280" />
          <Text style={{ ...styles.controlButtonText, textAlign: 'center' }}>Open in Google Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper to decode Google encoded polyline
function decodePolyline(encoded: string) {
  let points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }
  //console.log("Decoded polyline points:", points);
  return points;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
});