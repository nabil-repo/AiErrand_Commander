import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TaskInput from '../../components/TaskInput';
import PlaceCard, { Place } from '../../components/PlaceCard';
import { AIService, ParsedTask } from '../../services/aiService';
import { FoursquareService } from '../../services/foursquareService';
import { RouteService, OptimizedRoute } from '../../services/routeService';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<ParsedTask | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied. Please enable location services in your device settings.');
        return;
      }
    })();
  }, []);

  const handleTaskSubmit = async (taskInput: string) => {
    setIsProcessing(true);
    setParsedTasks(null);
    setOptimizedRoute(null);

    try {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("status: " + status);
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log("location: ", location);
      setUserLocation(location);

      // Parse tasks with AI
      const parsed = await AIService.parseTask(taskInput);
      setParsedTasks(parsed);

      // Find places for each task
      const allPlaces: Place[] = [];
      for (const task of parsed.tasks) {
        try {
          const places = await FoursquareService.searchPlaces(
            task.type,
            task.category,
            location.coords.latitude,
            location.coords.longitude
          );
          if (places.length > 0) {
            // Only add if not already in allPlaces
            if (!allPlaces.some(p => p.id === places[0].id)) {
              allPlaces.push({ ...places[0], taskType: task.type });
            }
          }
        } catch (error) {
          console.error(`Error finding places for ${task.category}:`, error);
        }
      }

      console.log("All places found:", allPlaces);

      // Optimize route
      if (allPlaces.length > 0) {
        const route = await RouteService.optimizeRoute(
          allPlaces,
          location.coords.latitude,
          location.coords.longitude
        );
        setOptimizedRoute(route);
        console.log("Optimized route:", route);

        // Save to history
        await saveErrandToHistory(taskInput, allPlaces, route.totalDistance);

        // Save route to AsyncStorage and navigate to Map
        await AsyncStorage.setItem('latestOptimizedRoute', JSON.stringify(route));
        router.push('/(tabs)/map');
      }
    } catch (error) {
      console.error('Error processing task:', error);
      // Show error to user
      alert('Error processing your request. Please check your API keys and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetDirections = (place: Place) => {
    // In production, this would open Maps app with directions
    console.log('Getting directions to:', place.name);
  };

  const saveErrandToHistory = async (taskInput, places, totalDistance) => {
    try {
      const stored = await AsyncStorage.getItem('errandHistory');
      const history = stored ? JSON.parse(stored) : [];
      const newEntry = {
        id: Date.now().toString(),
        taskInput,
        placesCount: places.length,
        totalDistance,
        date: new Date().toISOString(),
        completed: true,
      };
      history.unshift(newEntry);
      await AsyncStorage.setItem('errandHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save errand history:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Errand Commander</Text>
          <Text style={styles.headerSubtitle}>Smart task-to-place optimizer</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TaskInput onTaskSubmit={handleTaskSubmit} isProcessing={isProcessing} />
        {isProcessing && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.spinnerText}>
              {parsedTasks === null
                ? "Identifying your tasks with AI..."
                : optimizedRoute === null
                  ? "Finding the best places nearby using Foursquare..."
                  : "Optimizing your route..."}
            </Text>
          </View>
        )}

        {!isProcessing && parsedTasks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Errand Plan</Text>
            <View style={styles.taskSummary}>
              <Ionicons name="list" size={20} color="#3B82F6" />
              <Text style={styles.taskSummaryText}>
                Found {parsedTasks.tasks.length} task{parsedTasks.tasks.length !== 1 ? 's' : ''}: {parsedTasks.tasks.map(t => t.type).join(', ')}
              </Text>
            </View>
          </View>
        )}

        {!isProcessing && optimizedRoute && (
          <View style={styles.section}>
            <View style={styles.routeHeader}>
              <Text style={styles.sectionTitle}>Optimized Route</Text>
              <View style={styles.routeStats}>
                <View style={styles.statItem}>
                  <Ionicons name="walk" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{optimizedRoute.totalDistance}m</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{optimizedRoute.totalTime} min</Text>
                </View>
              </View>
            </View>

            {optimizedRoute.places.map((place, index) => (
              <View key={`${place.id}_${index}`} style={styles.placeCardContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.placeCardWrapper}>
                  <PlaceCard
                    place={place}
                    taskType={place.taskType || place.category}
                    onGetDirections={handleGetDirections}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {!parsedTasks && !isProcessing && (
          <View style={styles.emptyState}>
            <Ionicons name="map" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Ready to plan your errands!</Text>
            <Text style={styles.emptyStateText}>
              Enter your tasks above and I'll find the best places nearby with an optimized route.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
  },
  content: {
    flex: 1,
    marginTop: -10,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  taskSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  taskSummaryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  placeCardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 8,
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  placeCardWrapper: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  spinnerText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});