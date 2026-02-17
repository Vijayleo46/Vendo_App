import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions, RefreshControl, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { MotiView, AnimatePresence } from 'moti';
import { Typography } from '../components/common/Typography';
import { Search, MapPin, Bell, Home, Smartphone, Car, Briefcase, Settings, Mic, Star, Zap, ChevronLeft, Heart } from 'lucide-react-native';
import { listingService, Listing } from '../services/listingService';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { AnimatedProductCard } from '../components/home/AnimatedProductCard';
import { auth } from '../core/config/firebase';
import { userService, UserProfile } from '../services/userService';
import { useTheme } from '../theme/ThemeContext';

const OLX_TEAL = '#002f34';
const PLACEHOLDERS = ['cars', 'jobs', 'mobiles', 'properties', 'everything'];

interface Category {
  id: string;
  label: string;
  value: string;
  image: string;
}

const CATEGORIES: Category[] = [
  { id: '2', label: 'Mobiles', value: 'Mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
  { id: '3', label: 'Cars', value: 'Vehicles', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop' },
  { id: '8', label: 'Bikes', value: 'Bikes', image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=200&h=200&fit=crop' },
  { id: '4', label: 'Houses', value: 'Real Estate', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=200&fit=crop' },
  { id: '9', label: 'Land', value: 'Land & Plots', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop' },
  { id: '5', label: 'Electronics', value: 'Electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop' },
  { id: '10', label: 'Furniture', value: 'Furniture', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop' },
  { id: '6', label: 'Jobs', value: 'Jobs', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop' },
  { id: '7', label: 'Services', value: 'Services', image: 'https://images.unsplash.com/photo-1621905252507-b354bc2d1f6c?w=200&h=200&fit=crop' },
];

const Typewriter = ({ texts }: { texts: string[] }) => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  // Typing logic
  useEffect(() => {
    if (index === texts.length) return;

    if (subIndex === texts[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 75 : subIndex === texts[index].length ? 1500 : 100, Math.random() * 50));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, texts]);

  return (
    <Typography style={{ color: theme.textSecondary, fontSize: 15 }}>
      Search "{texts[index].substring(0, subIndex)}"
      <Typography style={{ color: blink ? theme.textSecondary : 'transparent' }}>|</Typography>
    </Typography>
  );
};

const AnimatedCategoryItem = ({ index, children }: { index: number; children: React.ReactNode }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 500 }));
    // Removed scale animation to prevent "jump" effect
    scale.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

export const HomeScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const isFocused = useIsFocused();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('All');
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);
  const [location, setLocation] = useState('Panampilly Nagar, Kochi');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Placeholder interval removed in favor of Typewriter component

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profile = await userService.getProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      }
    };

    if (isFocused) {
      fetchUserProfile();
    }
  }, [isFocused]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      let allListings = await listingService.getFeaturedListings(60);

      if (allListings.length === 0) {
        await listingService.seedDemoData();
        allListings = await listingService.getFeaturedListings(60);
      }

      setListings(allListings);

      // Fetch recently viewed
      const recent = await listingService.getRecentlyViewed();
      setRecentlyViewed(recent);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchListings();
    }
  }, [isFocused, fetchListings]);

  const sections = useMemo(() => {
    const myProducts = listings.filter(l => l.sellerId === auth.currentUser?.uid && l.type !== 'job');
    const otherProducts = listings.filter(l => l.sellerId !== auth.currentUser?.uid && l.type !== 'job');
    const jobs = listings.filter(l => l.type === 'job');

    const filterByCat = (items: Listing[]) => {
      if (activeCategory === 'All') return items;
      return items.filter(l =>
        l.category === activeCategory ||
        (activeCategory === 'Vehicles' && l.category === 'Vehicles') ||
        (activeCategory === 'Real Estate' && l.category === 'Real Estate') ||
        (activeCategory === 'Electronics' && l.category === 'Electronics')
      );
    };

    const shuffle = (array: any[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    return {
      products: filterByCat([...myProducts, ...otherProducts]),
      jobs: filterByCat(jobs),
      all: activeCategory === 'All' ? shuffle(filterByCat(listings)) : filterByCat(listings)
    };
  }, [listings, activeCategory]);

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 4, height: 18, backgroundColor: theme.primary, borderRadius: 2, marginRight: 10 }} />
        <Typography style={{ color: theme.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 }}>
          {title}
        </Typography>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Typography style={{ color: theme.primary, fontSize: 14, fontWeight: '800' }}>See All</Typography>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={[theme.background, theme.surface, theme.background]}
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.3 : 0.8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView edges={['top']}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 }}>
          <Typography style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>
            VENDO
          </Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 }}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Typography style={{ color: theme.text, fontSize: 13, fontWeight: '800' }}>{userProfile?.coins || 0}</Typography>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
              <Heart size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Bell size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, marginTop: 4, gap: 4 }}>
          <MapPin size={16} color={theme.text} />
          <Typography style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>
            {location?.split(',')[0] || 'Kochi'}
          </Typography>
          <ChevronLeft size={14} color={theme.text} style={{ transform: [{ rotate: '-90deg' }] }} />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            marginHorizontal: 20,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
            <Search size={22} color={theme.primary} />
            <Typewriter texts={PLACEHOLDERS} />
          </View>
          <Mic size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchListings} />}
      >
        <View style={{ marginTop: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <AnimatedCategoryItem key={cat.id} index={Number(cat.id)}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveCategory(cat.value)}
                    style={{ alignItems: 'center' }}
                  >
                    <View style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: theme.card,
                      padding: 2,
                      marginBottom: 8,
                      shadowColor: theme.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isActive ? 0.2 : 0.05,
                      shadowRadius: 8,
                      elevation: 4,
                      borderWidth: 2,
                      borderColor: isActive ? theme.primary : 'transparent'
                    }}>
                      <Image
                        source={{ uri: cat.image }}
                        style={{ width: '100%', height: '100%', borderRadius: 28 }}
                      />
                    </View>
                    <Typography style={{
                      fontSize: 12,
                      fontWeight: isActive ? '800' : '600',
                      color: isActive ? theme.primary : theme.textSecondary,
                      letterSpacing: 0.2
                    }}>
                      {cat.label}
                    </Typography>
                  </TouchableOpacity>
                </AnimatedCategoryItem>
              );
            })}
          </ScrollView>
        </View>

        {recentlyViewed.length > 0 && (
          <View>
            {renderSectionHeader('Recently Viewed')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
              {recentlyViewed.map((item, index) => (
                <View key={item.id} style={{ width: 140 }}>
                  <AnimatedProductCard
                    index={index}
                    {...item}
                    compact={true}
                    createdAt={item.createdAt}
                    onPress={() => navigation.navigate('ProductDetails', { product: item })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {(activeCategory === 'All' ? sections.all : sections.products).length > 0 && (
          <View>
            {renderSectionHeader(activeCategory === 'All' ? 'Fresh Recommendations' : `Browse ${activeCategory} `)}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              {(activeCategory === 'All' ? sections.all : sections.products).map((item, index) => (
                <View key={item.id} style={{ width: '48%' }}>
                  <AnimatedProductCard
                    index={index % 6} // Reset stagger for better flow in grid
                    {...item}
                    createdAt={item.createdAt}
                    onPress={() => navigation.navigate('ProductDetails', { product: item })}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
