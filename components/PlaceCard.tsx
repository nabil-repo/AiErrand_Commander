import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';

export interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
  distance: number;
  rating: number;
  hours: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  taskType?: string;
}

interface PlaceCardProps {
  place: Place;
  taskType: string;
  onGetDirections: (place: Place) => void;
}

export default function PlaceCard({ place, taskType, onGetDirections }: PlaceCardProps) {
  const handleCall = () => {
    if (place.phone) {
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  const handleWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'grocery': 'basket',
      'pharmacy': 'medical',
      'restaurant': 'restaurant',
      'cafe': 'cafe',
      'bank': 'card',
      'gas_station': 'car',
      'shopping': 'bag',
      'gym': 'fitness',
      'default': 'location'
    };
    return iconMap[category] || iconMap.default;
  };



  const getTaskColor = (taskType: string): [ColorValue, ColorValue] => {
    const colorMap: { [key: string]: [ColorValue, ColorValue] } = {
      'grocery': ['#10B981', '#059669'],
      'pharmacy': ['#EF4444', '#DC2626'],
      'restaurant': ['#F59E0B', '#D97706'],
      'cafe': ['#8B5CF6', '#7C3AED'],
      'bank': ['#3B82F6', '#2563EB'],
      'gym': ['#6B7280', '#4B5563'],
      'default': ['#6B7280', '#4B5563']

    };
    return colorMap[taskType] || colorMap.default;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.taskBadge}>
          <LinearGradient
            colors={getTaskColor(taskType)}
            style={styles.taskBadgeGradient}
          >
            <Ionicons
              name={getCategoryIcon(place.category) as any}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.taskBadgeText}>{taskType}</Text>
          </LinearGradient>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.rating}>{place.rating}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.address}>{place.address}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="walk" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{place.distance}m away</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{place.hours}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onGetDirections(place)}
        >
          <Ionicons name="navigate" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity> */}

        {place.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
          >
            <Ionicons name="call" size={20} color="#10B981" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}

        {place.website && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWebsite}
          >
            <Ionicons name="globe" size={20} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  taskBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  taskBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  content: {
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
});