import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Dimensions, Image, StatusBar, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Search, Filter, Grid, List as ListIcon, X, ArrowUpRight, MapPin } from 'lucide-react-native';
import { ProductCard } from '../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listingService, Listing } from '../services/listingService';
import { auth } from '../core/config/firebase';


const { width } = Dimensions.get('window');

// Mock data for search suggestions - in a real app this would come from an API
const SUGGESTIONS = [
    'iPhone 13 Pro', 'MacBook Air', 'PS5 Console', 'Royal Enfield', 'Apartment in Kochi', 'Sofa Set'
];



export const SearchScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [results, setResults] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState<Listing[]>([]);

    // Focus input on mount
    const inputRef = React.useRef<TextInput>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const loadRecommended = async () => {
            const items = await listingService.getFeaturedListings(4);
            setRecommendedProducts(items);
        };
        loadRecommended();
    }, []);

    const handleSearch = async (text: string, type: 'query' | 'location') => {
        let newSearch = searchQuery;
        let newLocation = locationQuery;

        if (type === 'query') {
            setSearchQuery(text);
            newSearch = text;
        } else {
            setLocationQuery(text);
            newLocation = text;
        }

        if (newSearch.length > 2 || newLocation.length > 2) {
            setIsLoading(true);
            try {
                const searchResults = await listingService.searchListings(newSearch, newLocation);
                setResults(searchResults);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setResults([]);
        }
    };

    const renderSearchResult = ({ item, index }: { item: Listing; index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 50).springify()}
            style={{ width: '50%', padding: 6 }}
        >
            <ProductCard
                title={item.title}
                price={item.price}
                image={item.images?.[0] || 'https://via.placeholder.com/150'}
                location={item.location}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
            />
        </Animated.View>
    );

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Search Header */}
            <View style={styles.header}>
                <View style={styles.searchBarContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowUpRight size={24} color="#002f34" style={{ transform: [{ rotate: '225deg' }] }} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, gap: 8 }}>
                        {/* Keyword Search */}
                        <View style={styles.searchInputWrapper}>
                            <Search size={20} color="#002f34" strokeWidth={2} />
                            <TextInput
                                ref={inputRef}
                                style={styles.searchInput}
                                placeholder="Search for cars, guitars, property..."
                                placeholderTextColor="#7f9799"
                                value={searchQuery}
                                onChangeText={(t) => handleSearch(t, 'query')}
                                selectionColor="#002f34"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => handleSearch('', 'query')}>
                                    <X size={20} color="#7f9799" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Location Search */}
                        <View style={styles.searchInputWrapper}>
                            <MapPin size={20} color="#002f34" strokeWidth={2} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by location (e.g. Kochi)"
                                placeholderTextColor="#7f9799"
                                value={locationQuery}
                                onChangeText={(t) => handleSearch(t, 'location')}
                                selectionColor="#002f34"
                            />
                            {locationQuery.length > 0 && (
                                <TouchableOpacity onPress={() => handleSearch('', 'location')}>
                                    <X size={20} color="#7f9799" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#002f34" />
                    </View>
                ) : searchQuery.length > 0 ? (
                    <FlatList
                        data={results}
                        renderItem={renderSearchResult}
                        keyExtractor={item => item.id || Math.random().toString()}
                        numColumns={2}
                        contentContainerStyle={styles.resultsList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <Typography style={styles.emptyText}>No results found for "{searchQuery}"</Typography>
                            </View>
                        }
                    />
                ) : (
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>



                        {/* Popular Searches */}
                        <View style={styles.sectionContainer}>
                            <Typography style={[styles.sectionTitle, { marginBottom: 12 }]}>Popular Searches</Typography>
                            <View style={styles.chipsContainer}>
                                {SUGGESTIONS.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.chip}
                                        onPress={() => handleSearch(item, 'query')}
                                    >
                                        <Typography style={styles.chipText}>{item}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    backButton: {
        padding: 4,
        marginTop: 8, // Center with the first input (height 50)
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#002f34',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    resultsList: {
        padding: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    sectionContainer: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002f34',
    },
    clearText: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '600',
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    recentText: {
        flex: 1,
        fontSize: 16,
        color: '#475569',
        marginLeft: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 14,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    categoryCard: {
        width: (width - 40 - 24) / 3, // 3 columns
        backgroundColor: '#F8FAFC',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    categoryIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#002f34',
    }
});
