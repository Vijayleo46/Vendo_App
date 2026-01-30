import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { hapticFeedback } from './HapticFeedback';

const { width: screenWidth } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

interface TabItem {
  name: string;
  label: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const AnimatedTab = ({
  tab,
  index,
  activeIndex,
  onPress,
  isCenterButton = false,
}: {
  tab: TabItem;
  index: number;
  activeIndex: number;
  onPress: () => void;
  isCenterButton?: boolean;
}) => {
  const { theme } = useTheme();
  const isActive = activeIndex === index;

  const scale = useSharedValue(1);

  const handlePress = () => {
    hapticFeedback.selection();
    scale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    onPress();
  };

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent = tab.icon;

  if (isCenterButton) {
    return (
      <View style={styles.centerButtonOuter}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          style={[styles.centerButton, { backgroundColor: '#002f34' }]}
        >
          <IconComponent
            size={28}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        </TouchableOpacity>
        <Text style={[styles.tabLabel, { color: '#002f34', marginTop: 4 }]}>
          {tab.label}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.tabContainer}
    >
      <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
        <IconComponent
          size={24}
          color={isActive ? '#002f34' : '#7f9799'}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <Text style={[
          styles.tabLabel,
          {
            color: isActive ? '#002f34' : '#7f9799',
            fontWeight: isActive ? '700' : '400'
          }
        ]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <AnimatedTab
            key={tab.name}
            tab={tab}
            index={index}
            activeIndex={activeIndex}
            isCenterButton={index === 2}
            onPress={() => onTabPress(index)}
          />
        ))}
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
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#dbe7e9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  centerButtonOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});