import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coords: LocationCoords;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

class LocationService {
  private currentLocation: LocationData | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Get address from coordinates
      const address = await this.reverseGeocode(coords);

      this.currentLocation = {
        coords,
        ...address,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async reverseGeocode(coords: LocationCoords): Promise<{
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  }> {
    try {
      const result = await Location.reverseGeocodeAsync(coords);
      if (result.length > 0) {
        const location = result[0];
        return {
          address: `${location.name || ''} ${location.street || ''}`.trim(),
          city: location.city || location.district || '',
          state: location.region || '',
          country: location.country || '',
        };
      }
      return {};
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {};
    }
  }

  calculateDistance(
    coords1: LocationCoords,
    coords2: LocationCoords
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coords2.latitude - coords1.latitude);
    const dLon = this.toRadians(coords2.longitude - coords1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coords1.latitude)) *
        Math.cos(this.toRadians(coords2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km away`;
    } else {
      return `${Math.round(distance)}km away`;
    }
  }

  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  async searchNearby(
    centerCoords: LocationCoords,
    radiusKm: number = 10
  ): Promise<LocationCoords[]> {
    // This would typically integrate with a places API
    // For now, return mock nearby locations
    const nearbyLocations: LocationCoords[] = [];
    
    // Generate some mock locations within radius
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const distance = Math.random() * radiusKm;
      
      const lat = centerCoords.latitude + (distance / 111) * Math.cos(angle);
      const lng = centerCoords.longitude + (distance / (111 * Math.cos(centerCoords.latitude * Math.PI / 180))) * Math.sin(angle);
      
      nearbyLocations.push({ latitude: lat, longitude: lng });
    }
    
    return nearbyLocations;
  }
}

export const locationService = new LocationService();