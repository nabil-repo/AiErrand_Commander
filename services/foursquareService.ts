// TODO: Update the import path below to the correct relative path if PlaceCard.tsx or PlaceCard.ts exists.
// For example, if PlaceCard.ts is in src/components, use:
import { Place } from '../components/PlaceCard';

export class FoursquareService {
  private static readonly API_KEY = " """;
  private static readonly BASE_URL = 'https://places-api.foursquare.com';

  static async searchPlaces(
    taskType: string,
    category: string,
    latitude: number,
    longitude: number,
    radius: number = 3000 // increased radius to 3 km
  ): Promise<Place[]> {
    try {
      const categoryMap: { [key: string]: string[] } = {
        'grocery': ['17069', '19014', '13000'], // supermarkets, convenience, grocery
        'pharmacy': ['17102', '19016'],
        'restaurant': ['13065', '13066', '13068'],
        'cafe': ['13032', '13033'],
        'bank': ['10019', '10020'],
        'gas_station': ['17110', '19022'],
        'shopping': ['17000', '17001'],
        'gym': ['18021', '18077']
      };

      const queryMap: { [type: string]: string } = {
        'lunch': 'restaurant',
        'dinner': 'restaurant',
        'ATM visit': 'ATM',
        'grocery shopping': 'supermarket',
        'coffee break': 'cafe',
        'tea break': 'cafe'
      };

      const categoryIds = categoryMap[category] || ['17000'];
      const query = queryMap[taskType] || taskType;

      let response = await fetch(
        `${this.BASE_URL}/places/search?ll=${latitude},${longitude}&radius=${radius}&categories=${categoryIds.join(',')}&query=${encodeURIComponent(query)}&limit=20&sort=DISTANCE`,
        {
          headers: {
            'Authorization': "Bearer " + this.API_KEY,
            'X-Places-Api-Version': "2025-06-17",
            'Accept': 'application/json'
          }
        }
      );

      let data = await response.json();
      console.log("Foursquare search data:", data);

      let results = data.results?.filter(
        (place: any) =>
          typeof place.latitude === 'number' &&
          typeof place.longitude === 'number'
      ) || [];

      // Fallback: If no results, retry with just category name
      if (results.length === 0) {
        const fallbackResponse = await fetch(
          `${this.BASE_URL}/places/search?ll=${latitude},${longitude}&radius=${radius}&query=${encodeURIComponent(category)}&limit=20&sort=DISTANCE`,
          {
            headers: {
              'Authorization': "Bearer " + this.API_KEY,
              'X-Places-Api-Version': "2025-06-17",
              'Accept': 'application/json'
            }
          }
        );

        const fallbackData = await fallbackResponse.json();
        results = fallbackData.results?.filter(
          (place: any) =>
            typeof place.latitude === 'number' &&
            typeof place.longitude === 'number'
        ) || [];
      }

      return results.map((place: any) => ({
        id: place.fsq_place_id || place.fsq_id,
        name: place.name,
        address:
          place.location.formatted_address ||
          `${place.location.address || ''} ${place.location.locality || ''}`.trim(),
        category,
        distance: place.distance,
        rating: place.rating || 0,
        hours: this.formatHours(place.hours),
        phone: place.tel,
        website: place.website,
        latitude: place.latitude,
        longitude: place.longitude
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }


  static async getPlaceDetails(fsqId: string): Promise<Place | null> {
    if (!this.API_KEY) {
      throw new Error('Foursquare API key not configured');
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/places/${fsqId}?fields=fsq_id,name,location,categories,hours,rating,tel,website,geocodes`,
        {
          headers: {
            'Authorization': "Bearer" + this.API_KEY,
            'X-Places-Api-Version': "2025-06-17",
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status}`);
      }

      const place = await response.json();

      return {
        id: place.fsq_id,
        name: place.name,
        address: place.location.formatted_address || `${place.location.address || ''} ${place.location.locality || ''}`.trim(),
        category: place.categories[0]?.name.toLowerCase() || 'general',
        distance: place.distance, // Distance would need to be calculated
        rating: place.rating || 0,
        hours: this.formatHours(place.hours),
        phone: place.tel,
        website: place.website,
        latitude: place.latitude,
        longitude: place.longitude
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }


  private static formatHours(hours: any): string {
    if (!hours || !hours.display) {
      return 'Hours not available';
    }
    return hours.display;
  }

  private static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // metres
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }

}

