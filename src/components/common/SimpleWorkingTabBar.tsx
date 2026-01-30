import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
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

interface SimpleWorkingTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export const SimpleWorkingTabBar: React.FC<SimpleWorkingTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Tab Items */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          const isPostTab = tab.name === 'PostTab';
          const IconComponent = tab.icon;

          if (isPostTab) {
            return (
              <TouchableOpacity
                key={`tab-${index}`}
                activeOpacity={0.8}
                onPress={() => {
                  console.log(`Tab ${index} (${tab.name}) pressed!`);
                  // Ensure we pass the index correctly, though for Post button usually it triggers a modal
                  // But MainNavigator handles the onPress. Use onTabPress for consistency if needed, 
                  // but MainNavigator passes tabs with specialized onPress. 
                  // Actually, SimpleWorkingTabBar calls onTabPress(index).
                  onTabPress(index);
                }}
                style={styles.postButton}
              >
                <IconComponent size={32} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={`tab-${index}`}
              activeOpacity={0.7}
              onPress={() => {
                console.log(`Tab ${index} (${tab.name}) pressed!`);
                onTabPress(index);
              }}
              style={styles.tabContainer}
            >
              <IconComponent
                size={24}
                color={isActive ? '#002f34' : '#94A3B8'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[
                styles.tabLabel,
                {
                  color: isActive ? '#002f34' : '#94A3B8',
                  fontWeight: isActive ? '700' : '500'
                }
              ]}>
                {tab.name.replace('Tab', '')}
              </Text>
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
    bottom: 24,
    left: 16,
    right: 16,
    height: 72,
    zIndex: 9999,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 0, // Removed border
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20, // For active state
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#002f34', // Dark Teal
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // Push it up
    shadowColor: '#002f34',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }
});