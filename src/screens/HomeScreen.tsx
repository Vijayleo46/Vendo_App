import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { MotiView, AnimatePresence } from 'moti';
import { Typography } from '../components/common/Typography';
import { Search, MapPin, Bell, Home, Smartphone, Car, Briefcase, Settings, Mic, Star, Zap, ChevronLeft } from 'lucide-react-native';
import { listingService, Listing } from '../services/listingService';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { auth } from '../core/config/firebase';
import { userService, UserProfile } from '../services/userService';

const OLX_TEAL = '#002f34';
const PLACEHOLDERS = ['cars', 'jobs', 'mobiles', 'properties', 'everything'];

const CATEGORIES = [
  { id: '1', label: 'All', value: 'All', icon: Home },
  { id: '2', label: 'Mobiles', value: 'Mobiles', icon: Smartphone },
  { id: '3', label: 'Cars', value: 'Vehicles', icon: Car },
  { id: '4', label: 'Property', value: 'Real Estate', icon: Home },
  { id: '5', label: 'Electronics', value: 'Electronics', icon: Zap },
  { id: '6', label: 'Jobs', value: 'Jobs', icon: Briefcase },
  { id: '7', label: 'Services', value: 'Services', icon: Settings },
];

const Typewriter = ({ texts }: { texts: string[] }) => {
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
    <Typography style={{ color: '#94A3B8', fontSize: 15 }}>
      Search "{texts[index].substring(0, subIndex)}"
      <Typography style={{ color: blink ? '#94A3B8' : 'transparent' }}>|</Typography>
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
  const isFocused = useIsFocused();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('All');
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

    return {
      products: filterByCat([...myProducts, ...otherProducts]),
      jobs: filterByCat(jobs),
      all: filterByCat(listings)
    };
  }, [listings, activeCategory]);

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
      <Typography style={{ color: '#002f34', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 }}>
        {title}
      </Typography>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Typography style={{ color: '#002f34', fontSize: 13, fontWeight: '700', opacity: 0.5 }}>See All</Typography>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator color={OLX_TEAL} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FAFAFA' }}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 }}>
          <Typography style={{ color: OLX_TEAL, fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>
            VENDO
          </Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 }}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Typography style={{ color: '#002f34', fontSize: 13, fontWeight: '800' }}>{userProfile?.coins || 0}</Typography>
            </TouchableOpacity>
            <TouchableOpacity>
              <Bell size={24} color={OLX_TEAL} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, marginTop: 4, gap: 4 }}>
          <MapPin size={16} color={OLX_TEAL} />
          <Typography style={{ color: OLX_TEAL, fontSize: 14, fontWeight: '700' }}>
            {location?.split(',')[0] || 'Kochi'}
          </Typography>
          <ChevronLeft size={14} color={OLX_TEAL} style={{ transform: [{ rotate: '-90deg' }] }} />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            marginHorizontal: 20,
            paddingHorizontal: 16,
            height: 52,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 10
          }}
        >
          <Search size={20} color="#64748B" />
          <View style={{ flex: 1, marginLeft: 12, height: 20, justifyContent: 'center' }}>
            <Typewriter texts={PLACEHOLDERS} />
          </View>
          <View style={{ width: 1, height: 20, backgroundColor: '#E2E8F0', marginHorizontal: 10 }} />
          <Mic size={20} color={OLX_TEAL} />
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
              const Icon = cat.icon;
              return (
                <AnimatedCategoryItem key={cat.id} index={Number(cat.id)}>
                  <TouchableOpacity
                    onPress={() => setActiveCategory(cat.value)}
                    style={{ alignItems: 'center' }}
                  >
                    <View style={{
                      width: 60, height: 60, borderRadius: 30,
                      backgroundColor: isActive ? OLX_TEAL : '#FFF',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: isActive ? OLX_TEAL : '#E2E8F0',
                      marginBottom: 8
                    }}>
                      <Icon size={24} color={isActive ? '#FFF' : '#334155'} />
                    </View>
                    <Typography style={{ fontSize: 12, fontWeight: isActive ? '700' : '500', color: isActive ? OLX_TEAL : '#64748B' }}>
                      {cat.label}
                    </Typography>
                  </TouchableOpacity>
                </AnimatedCategoryItem>
              );
            })}
          </ScrollView>
        </View>

        {sections.jobs.length > 0 && (activeCategory === 'All' || activeCategory === 'Jobs') && (
          <View>
            {renderSectionHeader('Jobs Nearby')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
              {sections.jobs.map((item) => (
                <View key={item.id} style={{ width: 200 }}>
                  <ProductCard
                    title={item.title}
                    price={item.price}
                    image={item.images[0]}
                    location={item.location}
                    type="job"
                    onPress={() => navigation.navigate('ProductDetails', { product: item })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {sections.products.length > 0 && (activeCategory === 'All' || activeCategory !== 'Jobs') && (
          <View>
            {renderSectionHeader('Browse All')}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              {sections.products.map((item) => (
                <View key={item.id} style={{ width: '48%' }}>
                  <ProductCard
                    {...item}
                    image={item.images[0]}
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
