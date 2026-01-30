import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const TAB_WIDTH = screenWidth / 5;

interface GooeyShapeProps {
  activeIndex: number;
  theme: any;
}

export const GooeyShape: React.FC<GooeyShapeProps> = ({ activeIndex, theme }) => {
  const animatedOffset = useSharedValue(0);
  const scaleProgress = useSharedValue(1);
  const morphProgress = useSharedValue(0.8);

  // Debug log
  console.log('GooeyShape activeIndex:', activeIndex);

  useEffect(() => {
    console.log('GooeyShape useEffect triggered, activeIndex:', activeIndex);
    
    // Move to new position with spring physics
    animatedOffset.value = withSpring(activeIndex * TAB_WIDTH, {
      damping: 20,
      stiffness: 150,
      mass: 1,
    });
    
    // Scale animation for bubble appearance
    scaleProgress.value = withSequence(
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(1.5)) }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    // Morph animation for liquid effect
    morphProgress.value = withSequence(
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
      withTiming(0.8, { duration: 200, easing: Easing.inOut(Easing.quad) })
    );
  }, [activeIndex]);

  const gooeyStyle = useAnimatedStyle(() => {
    const centerX = animatedOffset.value + TAB_WIDTH / 2;
    
    // Bubble size matching the image reference
    const bubbleSize = interpolate(morphProgress.value, [0, 1], [65, 80]);
    const scale = scaleProgress.value;
    
    console.log('Animation values - centerX:', centerX, 'bubbleSize:', bubbleSize, 'scale:', scale);
    
    return {
      transform: [
        { translateX: centerX - bubbleSize / 2 },
        { scale: scale }
      ],
      width: bubbleSize,
      height: bubbleSize,
    };
  });

  const liquidStyle = useAnimatedStyle(() => {
    const stretch = interpolate(morphProgress.value, [0, 1], [1, 1.4]);
    const opacity = interpolate(morphProgress.value, [0, 0.5, 1], [0.9, 1, 0.7]);
    
    return {
      transform: [{ scaleX: stretch }],
      opacity: opacity,
    };
  });

  return (
    <Animated.View style={[styles.gooeyContainer, gooeyStyle]}>
      {/* Main bubble with exact size from image */}
      <Animated.View style={[styles.mainBubble, liquidStyle]}>
        <LinearGradient
          colors={[theme.primary, theme.secondary || theme.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bubbleGradient}
        />
      </Animated.View>
      
      {/* Glow effect */}
      <View style={styles.glowEffect}>
        <LinearGradient
          colors={[`${theme.primary}25`, `${theme.primary}10`, 'transparent']}
          style={styles.glowGradient}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gooeyContainer: {
    position: 'absolute',
    bottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBubble: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  bubbleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  glowEffect: {
    position: 'absolute',
    width: '130%',
    height: '130%',
    borderRadius: 45,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
});