import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Platform,
    Text,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { hapticFeedback } from './HapticFeedback';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 70;

interface TabItem {
    name: string;
    label: string;
    icon: React.ComponentType<any>;
    onPress: () => void;
}

interface ModernTabBarProps {
    tabs: TabItem[];
    activeIndex: number;
    onTabPress: (index: number) => void;
}

export const ModernTabBar: React.FC<ModernTabBarProps> = ({
    tabs,
    activeIndex,
    onTabPress,
}) => {
    const { theme, isDark } = useTheme();
    const tabWidth = SCREEN_WIDTH / tabs.length;

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <View style={styles.tabsWrapper}>
                {tabs.map((tab, index) => {
                    const isActive = activeIndex === index;
                    const Icon = tab.icon;
                    const isCenter = index === 2; // "Post" button

                    const animatedIconStyle = useAnimatedStyle(() => {
                        return {
                            transform: [{
                                scale: withSpring(isActive ? 1.15 : 1, { damping: 12 })
                            }],
                        };
                    });

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            onPress={() => {
                                hapticFeedback.impact();
                                onTabPress(index);
                            }}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[
                                styles.iconContainer,
                                isCenter && [
                                    styles.centerButton,
                                    {
                                        backgroundColor: theme.primary,
                                        borderColor: theme.surface,
                                        shadowColor: theme.primary
                                    }
                                ],
                                animatedIconStyle
                            ]}>
                                <Icon
                                    size={isCenter ? 28 : 24}
                                    color={isCenter ? '#FFFFFF' : (isActive ? theme.primary : theme.textTertiary)}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </Animated.View>
                            {!isCenter && (
                                <Text style={[
                                    styles.label,
                                    { color: isActive ? theme.primary : theme.textTertiary, fontWeight: isActive ? '700' : '500' }
                                ]}>
                                    {tab.label}
                                </Text>
                            )}
                            {isCenter && (
                                <Text style={[
                                    styles.label,
                                    { color: isActive ? theme.primary : theme.textTertiary, fontWeight: isActive ? '700' : '500', marginTop: 22 }
                                ]}>
                                    {tab.label}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: TAB_BAR_HEIGHT,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    tabsWrapper: {
        flexDirection: 'row',
        height: '100%',
        paddingBottom: Platform.OS === 'ios' ? 25 : 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    centerButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginTop: -20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 4,
    },
    label: {
        fontSize: 10,
        marginTop: 4,
    },
});
