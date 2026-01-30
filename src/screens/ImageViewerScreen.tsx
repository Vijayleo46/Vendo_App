import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StatusBar, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Rotate3d } from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const ImageViewerScreen = ({ route, navigation }: any) => {
  const { images = [], initialIndex = 0 } = route.params || {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const currentImageUrl = images[currentIndex] || '';

  // Animation Values
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const zoomScale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panContext = useSharedValue({ x: 0, y: 0 });

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetAnimations = () => {
    rotateX.value = withSpring(0);
    rotateY.value = withSpring(0);
    zoomScale.value = withSpring(1);
    baseScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const handleImageSwitch = (index: number) => {
    if (index === currentIndex) return;
    triggerHaptic();
    setImageLoading(true);
    resetAnimations();
    setCurrentIndex(index);
  };

  // Combined Pan & Scroll Gesture (Amazon Style 360)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      panContext.value = { x: translateX.value, y: translateY.value };
      runOnJS(triggerHaptic)();
    })
    .onUpdate((e) => {
      // Update Translation (Panning/Scrolling)
      translateX.value = panContext.value.x + e.translationX;
      translateY.value = panContext.value.y + e.translationY;

      // High Sensitivity 3D Tilt (Amazon Style "Spin")
      const tiltFactorX = 25;
      const tiltFactorY = 40;

      rotateY.value = interpolate(e.translationX, [-width / 2, width / 2], [-tiltFactorY, tiltFactorY], 'clamp');
      rotateX.value = interpolate(e.translationY, [-height / 2, height / 2], [tiltFactorX, -tiltFactorX], 'clamp');
    })
    .onEnd(() => {
      // If not zoomed in, snap back to center
      if (zoomScale.value <= 1.1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }

      // Always spring back the 3D tilt
      rotateX.value = withSpring(0, { damping: 12 });
      rotateY.value = withSpring(0, { damping: 12 });
      runOnJS(triggerHaptic)();
    });

  // Pinch to Zoom Gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      zoomScale.value = baseScale.value * e.scale;
    })
    .onEnd(() => {
      baseScale.value = zoomScale.value;
      if (zoomScale.value < 1) {
        zoomScale.value = withSpring(1);
        baseScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      if (zoomScale.value > 5) {
        zoomScale.value = withSpring(5);
        baseScale.value = 5;
      }
    });

  // Combine Gestures
  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      zIndex: 10,
      transform: [
        { perspective: 1000 },
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: zoomScale.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  });

  // Safety timeout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoading) setImageLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [imageLoading, currentIndex]);

  const handleLoadSuccess = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleLoadError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!currentImageUrl) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="black" />
        <View style={styles.errorContainer}>
          <Typography style={styles.errorText}>No image found</Typography>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonMinimal}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Premium Blurred Background */}
        <View style={StyleSheet.absoluteFill}>
          <AnimatePresence>
            <MotiView
              key={`bg-${currentIndex}`}
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={StyleSheet.absoluteFill}
            >
              <Image
                source={{ uri: currentImageUrl }}
                style={StyleSheet.absoluteFill}
                blurRadius={50}
                resizeMode="cover"
              />
            </MotiView>
          </AnimatePresence>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        </View>

        {/* Full Screen Image with Amazon Style 360 Interaction */}
        <GestureDetector gesture={combinedGesture}>
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <AnimatePresence>
              <MotiView
                key={currentIndex}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: 'timing', duration: 400 }}
              >
                <Image
                  source={{ uri: currentImageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                  onLoad={handleLoadSuccess}
                  onError={handleLoadError}
                />
              </MotiView>
            </AnimatePresence>
          </Animated.View>
        </GestureDetector>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="light" />
            <View style={styles.thumbnailContent}>
              {images.map((img: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImageSwitch(index)}
                  activeOpacity={0.8}
                  style={[
                    styles.thumbnailItem,
                    currentIndex === index && styles.activeThumbnail
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                  {currentIndex === index && (
                    <MotiView
                      style={StyleSheet.absoluteFill}
                      animate={{ borderColor: '#FFF', borderWidth: 2 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 360° Indicator Badge */}
        <AnimatePresence>
          {!imageLoading && (
            <MotiView
              from={{ opacity: 0, scale: 0.5, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 500 }}
              style={[styles.badgeContainer, { bottom: images.length > 1 ? 120 : 50 }]}
            >
              <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="light" />
              <Rotate3d size={20} color="#FFF" />
              <Typography style={styles.badgeText}>360° VIEW</Typography>
            </MotiView>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Typography style={styles.loadingText}>Refining Visuals...</Typography>
          </View>
        )}

        {/* Error Overlay */}
        {imageError && (
          <View style={styles.errorOverlay}>
            <Typography style={styles.errorText}>Failed to load image</Typography>
          </View>
        )}

        {/* Back Button Floating */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
            <ChevronLeft size={28} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 70,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backButtonMinimal: {
    marginTop: 20,
    padding: 10,
  },
  imageContainer: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 210,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 80,
  },
  thumbnailContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 12,
  },
  thumbnailItem: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  activeThumbnail: {
    transform: [{ scale: 1.1 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
});
