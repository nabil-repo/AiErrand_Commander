import { Place } from '../components/PlaceCard';

export interface OptimizedRoute {
  places: Place[];
  totalDistance: number;
  totalTime: number;
  polyline?: string;
}

export class RouteService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  static async optimizeRoute(places: Place[], startLatitude: number, startLongitude: number): Promise<OptimizedRoute> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, using simple distance-based optimization');
      return this.fallbackOptimization(places, startLatitude, startLongitude);
    }

    try {
      const origin = `${startLatitude},${startLongitude}`;
      const waypoints = places.map(p => `${p.latitude},${p.longitude}`).join('|');
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${origin}&waypoints=optimize:true|${waypoints}&key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google Maps API error: ${response.status}`);
      const data = await response.json();

      // Parse the optimized order and polyline from the response
      const order = data.routes[0]?.waypoint_order || [];
      const polyline = data.routes[0]?.overview_polyline?.points || '';
      const sortedPlaces = order.map(i => places[i]);

      const totalDistance = data.routes[0]?.legs.reduce((sum, leg) => sum + leg.distance.value, 0) || 0;
      const totalTime = data.routes[0]?.legs.reduce((sum, leg) => sum + leg.duration.value, 0) || 0;

      return {
        places: sortedPlaces,
        totalDistance,
        totalTime,
        polyline,
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      return this.fallbackOptimization(places, startLatitude, startLongitude);
    }
  }

  private static fallbackOptimization(places: Place[], startLatitude: number, startLongitude: number): OptimizedRoute {
    // Simple distance-based optimization
    const sortedPlaces = [...places].sort((a, b) => {
      const distanceA = this.calculateDistance(startLatitude, startLongitude, a.latitude, a.longitude);
      const distanceB = this.calculateDistance(startLatitude, startLongitude, b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    const totalDistance = sortedPlaces.reduce((sum, place) => sum + place.distance, 0);
    const totalTime = Math.round(totalDistance / 80 * 60); // Assume 80m/min walking speed

    return {
      places: sortedPlaces,
      totalDistance,
      totalTime,
    };
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  static async getDirections(origin: string, destination: string): Promise<any> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }
}
