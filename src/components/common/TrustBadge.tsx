import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Shield } from 'lucide-react-native';

interface TrustBadgeProps {
    trustScore: number;
    size?: 'small' | 'medium' | 'large';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ trustScore, size = 'medium' }) => {
    const getColor = () => {
        if (trustScore >= 90) return '#FFD700'; // Gold
        if (trustScore >= 70) return '#10B981'; // Green
        if (trustScore >= 40) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const getLabel = () => {
        if (trustScore >= 90) return 'Elite';
        if (trustScore >= 70) return 'Trusted';
        if (trustScore >= 40) return 'Good';
        return 'New';
    };

    const sizes = {
        small: { fontSize: 10, iconSize: 12, padding: 4 },
        medium: { fontSize: 12, iconSize: 14, padding: 6 },
        large: { fontSize: 14, iconSize: 16, padding: 8 },
    };

    const config = sizes[size];
    const color = getColor();

    return (
        <View style={[styles.container, { backgroundColor: color, padding: config.padding }]}>
            <Shield size={config.iconSize} color="#FFF" fill="#FFF" />
            <Typography
                style={{
                    color: '#FFF',
                    fontSize: config.fontSize,
                    fontWeight: '800',
                    marginLeft: 4
                }}
            >
                {getLabel()}
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
});
