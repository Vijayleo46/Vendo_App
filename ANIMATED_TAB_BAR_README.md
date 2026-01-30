# 🎨 Animated Tab Bar with Gooey Bubble Effect

A beautiful, high-performance animated bottom navigation bar for React Native with smooth gooey bubble animations, built with React Native Reanimated 3.

## ✨ Features

- **Gooey Bubble Animation**: Smooth liquid-like bubble that appears when tabs are selected
- **60fps Performance**: Built with React Native Reanimated for native performance
- **Haptic Feedback**: Subtle haptic feedback on tab selection (iOS)
- **Gradient Effects**: Beautiful gradient backgrounds and glow effects
- **Theme Support**: Automatically adapts to light/dark themes
- **Ripple Effects**: Touch ripple animations for better user feedback
- **iOS Blur**: Native blur effects on iOS for premium feel
- **Responsive Design**: Adapts to different screen sizes

## 🎯 Animation Details

### Gooey Bubble Effect
- When a tab is selected, a bubble smoothly scales up from the tab bar
- The icon floats up into the bubble with a spring animation
- Smooth color transitions with gradient effects
- Subtle glow effect around active bubble

### Micro-interactions
- Press feedback with scale animation
- Ripple effect on touch
- Wave background that follows active tab
- Icon scaling and positioning animations

## 🚀 Usage

The animated tab bar is already integrated into your navigation system. It automatically:

1. **Tracks Navigation State**: Syncs with React Navigation tab changes
2. **Handles Tab Switching**: Smooth transitions between screens
3. **Post Modal Integration**: Special handling for the post/add button
4. **Theme Integration**: Uses your app's theme colors

### Tab Configuration

Your tabs are configured in `MainNavigator.tsx`:

```typescript
const tabs = [
  { name: 'HomeTab', icon: Home, onPress: () => navigation.navigate('HomeTab') },
  { name: 'SearchTab', icon: Search, onPress: () => navigation.navigate('SearchTab') },
  { name: 'PostTab', icon: Plus, onPress: () => setIsPostModalVisible(true) },
  { name: 'ChatTab', icon: MessageCircle, onPress: () => navigation.navigate('ChatTab') },
  { name: 'ProfileTab', icon: User, onPress: () => navigation.navigate('ProfileTab') }
];
```

## 🎨 Customization

### Colors & Themes
The tab bar automatically uses your theme colors from `src/theme/colors.ts`:
- `theme.primary`: Main bubble gradient start
- `theme.secondary`: Bubble gradient end
- `theme.textTertiary`: Inactive icon color

### Animation Timing
You can adjust animation parameters in `AnimatedTabBar.tsx`:

```typescript
// Bubble animation
bubbleScale.value = withSpring(1, {
  damping: 12,    // Lower = more bouncy
  stiffness: 200, // Higher = faster
});

// Icon float animation
translateY.value = withSpring(-22, {
  damping: 15,
  stiffness: 180,
});
```

### Bubble Size & Positioning
```typescript
const BUBBLE_SIZE = 56;        // Bubble diameter
const TAB_BAR_HEIGHT = 88;     // iOS height (64 on Android)
```

## 📱 Platform Differences

### iOS
- Native blur effect with `BlurView`
- Haptic feedback support
- Taller tab bar (88px) for safe area

### Android
- Gradient background fallback
- Standard height (64px)
- Elevation shadows

## 🔧 Dependencies

Required packages (already in your project):
- `react-native-reanimated` (^4.1.1)
- `expo-linear-gradient` (^15.0.8)
- `expo-blur` (^15.0.8)
- `lucide-react-native` (^0.469.0)

## 🎭 Animation Breakdown

1. **Tab Press Detection**: TouchableOpacity captures press
2. **Haptic Trigger**: Light haptic feedback (iOS)
3. **Ripple Start**: Expanding circle animation
4. **Bubble Scale**: Gooey bubble scales up with bounce
5. **Icon Float**: Icon moves up into bubble
6. **Glow Effect**: Subtle glow appears around bubble
7. **Wave Slide**: Background wave slides to new position
8. **Navigation**: Screen transition occurs

## 🎨 Design Inspiration

The design follows modern mobile app trends with:
- **Neumorphism**: Soft shadows and gradients
- **Fluid Motion**: Organic, liquid-like animations
- **Minimalism**: Clean icons and subtle effects
- **Accessibility**: High contrast and clear visual feedback

## 🔄 State Management

The tab bar maintains its own state while staying in sync with React Navigation:
- `activeTabIndex`: Current active tab (0-4)
- `isPostModalVisible`: Post type selector modal state
- Navigation listener updates active tab automatically

## 🎯 Performance Notes

- All animations run on the UI thread (60fps)
- Minimal re-renders with shared values
- Optimized gradient calculations
- Efficient shadow rendering

Your animated tab bar is now ready! The gooey bubble effect will create a delightful user experience that matches modern design trends. 🚀