import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from './common/Typography';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { DISTANCE_FILTERS } from '../utils/locationUtils';

interface DistanceFilterProps {
  selectedDistance: number;
  onDistanceSelect: (distance: number) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export const DistanceFilter: React.FC<DistanceFilterProps> = ({
  selectedDistance,
  onDistanceSelect,
  userLocation,
}) => {
  const { theme } = useTheme();

  if (!userLocation) {
    return (
      <View
        style={{
          backgroundColor: theme.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <MapPin size={20} color={theme.textSecondary} />
        <Typography
          style={{
            fontSize: 12,
            color: theme.textSecondary,
            textAlign: 'center',
          }}
        >
          Enable location to filter by distance
        </Typography>
      </View>
    );
  }

  return (
    <View>
      <Typography
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        Distance from you
      </Typography>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {DISTANCE_FILTERS.map((filter) => {
          const isSelected = selectedDistance === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => onDistanceSelect(filter.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isSelected ? theme.primary : theme.surface,
                borderWidth: 1,
                borderColor: isSelected ? theme.primary : theme.border,
                minWidth: 80,
                alignItems: 'center',
              }}
            >
              <Typography
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: isSelected ? '#FFF' : theme.text,
                }}
              >
                {filter.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};