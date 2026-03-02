import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Typography } from './common/Typography';
import { MapPin, Navigation, X, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { locationService, LocationData } from '../services/locationService';
import { KERALA_CITIES, getLocationDisplayName } from '../utils/locationUtils';

interface LocationPickerProps {
  selectedLocation: string;
  onLocationSelect: (location: string, coords?: { latitude: number; longitude: number }) => void;
  showCurrentLocation?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  onLocationSelect,
  showCurrentLocation = true,
}) => {
  const { theme, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        const displayName = location.city || location.address || 'Current Location';
        onLocationSelect(displayName, location.coords);
        setModalVisible(false);
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check your location settings.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to use this feature.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const selectCity = (city: { name: string; coords: { latitude: number; longitude: number } }) => {
    onLocationSelect(city.name, city.coords);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 6,
        }}
      >
        <MapPin size={16} color={theme.primary} />
        <Typography
          style={{
            color: theme.text,
            fontSize: 14,
            fontWeight: '600',
            flex: 1,
          }}
          numberOfLines={1}
        >
          {getLocationDisplayName(selectedLocation)}
        </Typography>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <Typography
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.text,
              }}
            >
              Select Location
            </Typography>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {/* Current Location */}
            {showCurrentLocation && (
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.primary + '10',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.primary + '30',
                    gap: 12,
                  }}
                >
                  {loadingLocation ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Navigation size={20} color={theme.primary} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Typography
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.primary,
                      }}
                    >
                      Use Current Location
                    </Typography>
                    <Typography
                      style={{
                        fontSize: 12,
                        color: theme.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      Get precise location automatically
                    </Typography>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Popular Cities */}
            <View style={{ padding: 20 }}>
              <Typography
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: theme.text,
                  marginBottom: 16,
                }}
              >
                Popular Cities in Kerala
              </Typography>
              
              {KERALA_CITIES.map((city, index) => {
                const isSelected = selectedLocation === city.name;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => selectCity(city)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 8,
                      backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.primary : theme.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.primary + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MapPin size={16} color={theme.primary} />
                      </View>
                      <Typography
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: isSelected ? theme.primary : theme.text,
                        }}
                      >
                        {city.name}
                      </Typography>
                    </View>
                    {isSelected && <Check size={20} color={theme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};