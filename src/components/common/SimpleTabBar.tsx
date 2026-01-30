import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User 
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

interface TabItem {
  name: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

interface SimpleTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const SimpleTab = ({ 
  tab, 
  index, 
  activeIndex, 
  onPress 
}: { 
  tab: TabItem; 
  index: number; 
  activeIndex: number; 
  onPress: () => void; 
}) => {
  const { theme } = useTheme();
  const isActive = activeIndex === index;
  
  const handlePress = () => {
    console.log('SimpleTab pressed:', index, tab.name);
    onPress();
  };

  const IconComponent = tab.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.tabContainer}
    >
      {/* Simple background for active tab */}
      {isActive && (
        <View style={[styles.activeBackground, { backgroundColor: theme.primary }]} />
      )}
      
      {/* Icon */}
      <View style={styles.iconContainer}>
        <IconComponent
          size={24}
          color={isActive ? '#FFFFFF' : theme.textTertiary}
          strokeWidth={2}
        />
      </View>
    </TouchableOpacity>
  );
};

export const SimpleTabBar: React.FC<SimpleTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
}) => {
  const { theme, isDark } = useTheme();

  console.log('SimpleTabBar render - activeIndex:', activeIndex);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(18, 18, 18, 0.95)', 'rgba(26, 26, 26, 0.90)']
          : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.90)']
        }
        style={styles.background}
      />

      {/* iOS Blur Effect */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurView}
        />
      )}

      {/* Top Border */}
      <View style={[styles.topBorder, { backgroundColor: theme.border }]} />

      {/* Tab Items */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <SimpleTab
            key={tab.name}
            tab={tab}
            index={index}
            activeIndex={activeIndex}
            onPress={() => {
              console.log('SimpleTabBar onPress:', index);
              onTabPress(index);
            }}
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
    zIndex: 1000, // Ensure it's on top
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    zIndex: 10,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    zIndex: 5,
  },
  activeBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.9,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});