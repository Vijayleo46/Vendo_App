import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnUI,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const TAB_WIDTH = screenWidth / 5;

interface SimpleGooeyShapeProps {
  activeIndex: number;
  theme: any;
}

export const SimpleGooeyShape: React.FC<SimpleGooeyShapeProps> = ({ activeIndex, theme }) => {
  const translateX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    console.log('SimpleGooeyShape - activeIndex changed from', currentIndex, 'to:', activeIndex);
    setCurrentIndex(activeIndex);
    
    // Force animation on UI thread
    runOnUI(() => {
      'worklet';
      translateX.value = withSpring(activeIndex * TAB_WIDTH, {
        damping: 20,
        stiffness: 150,
      });
    })();
  }, [activeIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  }, []);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[theme.primary, theme.secondary || theme.primary]}
        style={styles.bubble}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    width: TAB_WIDTH,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});