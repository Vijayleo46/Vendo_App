import React, { useEffect, useMemo } from 'react';
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
    withTiming,
    interpolate,
    Extrapolate,
    useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from './HapticFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 70;

interface TabItem {
    name: string;
    label: string;
    icon: React.ComponentType<any>;
    onPress: () => void;
}

interface LiquidTabBarProps {
    tabs: TabItem[];
    activeIndex: number;
    onTabPress: (index: number) => void;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({
    tabs,
    activeIndex,
    onTabPress,
}) => {
    const tabWidth = SCREEN_WIDTH / tabs.length;
    const translateX = useSharedValue(activeIndex * tabWidth);

    useEffect(() => {
        translateX.value = withSpring(activeIndex * tabWidth, {
            damping: 15,
            stiffness: 100,
        });
    }, [activeIndex]);

    const liquidIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const getLiquidPath = (x: number) => {
        // A fluid, organic shape for the indicator
        const w = tabWidth * 0.8;
        const h = 45;
        const cp = w * 0.25;

        return `
            M ${-w / 2} 0
            C ${-w / 2} 0 ${-cp} ${h} ${w / 2} ${h}
            C ${w / 2 + cp} ${h} ${w / 2} 0 ${w / 2} 0
            Z
        `;
    };

    return (
        <View style={styles.container}>
            {/* SVG Background Layer */}
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[styles.indicatorContainer, liquidIndicatorStyle]}>
                    <Svg width={tabWidth} height={TAB_BAR_HEIGHT}>
                        <Path
                            d={`M 0 0 L ${tabWidth} 0 L ${tabWidth} ${TAB_BAR_HEIGHT} L 0 ${TAB_BAR_HEIGHT} Z`}
                            fill="transparent"
                        />
                        <Path
                            d={`
                                M ${tabWidth * 0.1} 0
                                Q ${tabWidth * 0.5} ${25} ${tabWidth * 0.9} 0
                                L ${tabWidth * 0.9} ${TAB_BAR_HEIGHT}
                                L ${tabWidth * 0.1} ${TAB_BAR_HEIGHT}
                                Z
                            `}
                            fill="#FFFFFF"
                        />
                        {/* The actual fluid "well" or "drop" */}
                        <Path
                            d={`
                                M ${tabWidth * 0.1} 0
                                C ${tabWidth * 0.2} 0 ${tabWidth * 0.3} 40 ${tabWidth * 0.5} 40
                                C ${tabWidth * 0.7} 40 ${tabWidth * 0.8} 0 ${tabWidth * 0.9} 0
                            `}
                            fill="none"
                            stroke="#002f34"
                            strokeWidth={2}
                        />
                    </Svg>
                </Animated.View>
            </View>

            <View style={styles.tabsWrapper}>
                {tabs.map((tab, index) => {
                    const isActive = activeIndex === index;
                    const Icon = tab.icon;

                    // Animations for icons based on indicator position
                    const iconStyle = useAnimatedStyle(() => {
                        const distance = Math.abs(translateX.value / tabWidth - index);
                        const scale = interpolate(
                            distance,
                            [0, 0.5, 1],
                            [1.2, 1, 1],
                            Extrapolate.CLAMP
                        );
                        const translateY = interpolate(
                            distance,
                            [0, 0.5, 1],
                            [index === 2 ? -28 : -8, 0, 0],
                            Extrapolate.CLAMP
                        );

                        return {
                            transform: [
                                { scale },
                                { translateY }
                            ],
                        };
                    });

                    const labelStyle = useAnimatedStyle(() => {
                        const distance = Math.abs(translateX.value / tabWidth - index);
                        const opacity = interpolate(
                            distance,
                            [0, 0.3, 0.6],
                            [1, 0.5, 0],
                            Extrapolate.CLAMP
                        );
                        const translateY = interpolate(
                            distance,
                            [0, 0.5, 1],
                            [10, 20, 30],
                            Extrapolate.CLAMP
                        );

                        return {
                            opacity,
                            transform: [{ translateY }],
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
                            activeOpacity={1}
                        >
                            <Animated.View style={[styles.iconContainer, iconStyle]}>
                                <View style={[
                                    styles.iconCircle,
                                    index === 2 && styles.centerIconCircle,
                                    isActive && { backgroundColor: '#002f34' }
                                ]}>
                                    <Icon
                                        size={index === 2 ? 28 : 24}
                                        color={isActive ? '#FFFFFF' : '#7f9799'}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </View>
                            </Animated.View>
                            {!isActive && (
                                <Text style={[styles.staticLabel, { color: '#7f9799' }]}>
                                    {tab.label}
                                </Text>
                            )}
                            {isActive && (
                                <Animated.Text style={[styles.activeLabel, labelStyle, { color: '#002f34' }]}>
                                    {tab.label}
                                </Animated.Text>
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
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    tabsWrapper: {
        flexDirection: 'row',
        height: '100%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorContainer: {
        position: 'absolute',
        top: -1,
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#002f34',
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginTop: -10,
    },
    staticLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
    },
    activeLabel: {
        position: 'absolute',
        bottom: 12,
        fontSize: 11,
        fontWeight: '700',
    },
});
