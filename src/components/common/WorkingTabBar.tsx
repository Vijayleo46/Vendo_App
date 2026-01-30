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

interface WorkingTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export const WorkingTabBar: React.FC<WorkingTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
}) => {
  const { theme } = useTheme();

  const handleTabPress = (index: number) => {
    console.log('WorkingTabBar - Tab pressed:', index);
    onTabPress(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Top Border */}
      <View style={[styles.topBorder, { backgroundColor: theme.border }]} />

      {/* Tab Items */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          const IconComponent = tab.icon;
          
          return (
            <TouchableOpacity
              key={`${tab.name}-${index}`}
              activeOpacity={0.6}
              onPress={() => handleTabPress(index)}
              style={[
                styles.tabContainer,
                isActive && { 
                  backgroundColor: theme.primary,
                  borderRadius: 25,
                }
              ]}
            >
              <IconComponent
                size={24}
                color={isActive ? '#FFFFFF' : theme.textTertiary}
                strokeWidth={2}
              />
              <Text style={[
                styles.tabLabel,
                { 
                  color: isActive ? '#FFFFFF' : theme.textTertiary,
                  fontWeight: isActive ? '600' : '400'
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
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
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
    paddingHorizontal: 8,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});