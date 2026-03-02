import { LocationCoords } from '../services/locationService';

export const DISTANCE_FILTERS = [
  { label: 'Within 1km', value: 1 },
  { label: 'Within 5km', value: 5 },
  { label: 'Within 10km', value: 10 },
  { label: 'Within 25km', value: 25 },
  { label: 'Within 50km', value: 50 },
  { label: 'Anywhere', value: 1000 },
];

export const DEFAULT_LOCATION: LocationCoords = {
  latitude: 9.9312, // Kochi, Kerala
  longitude: 76.2673,
};

export const KERALA_CITIES = [
  { name: 'Kochi', coords: { latitude: 9.9312, longitude: 76.2673 } },
  { name: 'Thiruvananthapuram', coords: { latitude: 8.5241, longitude: 76.9366 } },
  { name: 'Kozhikode', coords: { latitude: 11.2588, longitude: 75.7804 } },
  { name: 'Thrissur', coords: { latitude: 10.5276, longitude: 76.2144 } },
  { name: 'Kollam', coords: { latitude: 8.8932, longitude: 76.6141 } },
  { name: 'Palakkad', coords: { latitude: 10.7867, longitude: 76.6548 } },
  { name: 'Alappuzha', coords: { latitude: 9.4981, longitude: 76.3388 } },
  { name: 'Malappuram', coords: { latitude: 11.0410, longitude: 76.0873 } },
  { name: 'Kannur', coords: { latitude: 11.8745, longitude: 75.3704 } },
  { name: 'Kasaragod', coords: { latitude: 12.4996, longitude: 74.9869 } },
];

export function isWithinRadius(
  center: LocationCoords,
  point: LocationCoords,
  radiusKm: number
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}

export function calculateDistance(
  coords1: LocationCoords,
  coords2: LocationCoords
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLon = toRadians(coords2.longitude - coords1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.latitude)) *
      Math.cos(toRadians(coords2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

export function sortByDistance(
  items: any[],
  userLocation: LocationCoords,
  getItemLocation: (item: any) => LocationCoords | null
): any[] {
  return items
    .map(item => {
      const itemLocation = getItemLocation(item);
      const distance = itemLocation 
        ? calculateDistance(userLocation, itemLocation)
        : Infinity;
      return { ...item, distance };
    })
    .sort((a, b) => a.distance - b.distance);
}

export function getLocationDisplayName(location: string | undefined): string {
  if (!location) return 'Unknown Location';
  
  // Extract city name from full address
  const parts = location.split(',');
  return parts[0]?.trim() || location;
}